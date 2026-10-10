import { setTimeout as sleep } from 'node:timers/promises';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalStatus } from '../approvals/approval-status.js';
import { ExecutionStep } from '../executions/entities/execution-step.entity.js';
import { Execution } from '../executions/entities/execution.entity.js';
import { ExecutionStatus } from '../executions/execution-status.js';
import { StepStatus, StepType } from '../executions/execution-step-enums.js';
import { ApprovalManager } from './approval-manager.service.js';
import { ExecutionStateManager } from './execution-state-manager.service.js';
import { MockPlanner, type PlannedToolCall } from './mock-planner.service.js';
import { ToolExecutionError } from './tool-execution.error.js';
import { ToolExecutor } from './tool-executor.service.js';

type ToolCallOutcome = 'completed' | 'paused' | 'failed' | 'cancelled';

const MAX_TOOL_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1_000;

@Injectable()
export class ExecutionRunner {
  private readonly logger = new Logger(ExecutionRunner.name);

  constructor(
    @InjectRepository(Execution)
    private readonly executionsRepository: Repository<Execution>,
    @InjectRepository(ExecutionStep)
    private readonly stepsRepository: Repository<ExecutionStep>,
    private readonly state: ExecutionStateManager,
    private readonly approvals: ApprovalManager,
    private readonly planner: MockPlanner,
    private readonly toolExecutor: ToolExecutor,
  ) {}

  async run(executionId: string): Promise<void> {
    const execution = await this.executionsRepository.findOneBy({
      id: executionId,
    });

    if (!execution) {
      return;
    }

    try {
      if (execution.status === ExecutionStatus.QUEUED) {
        await this.start(execution);
      } else if (execution.status === ExecutionStatus.WAITING_FOR_APPROVAL) {
        await this.resume(execution);
      }
    } catch (error) {
      this.logger.error(
        `Execution ${execution.id} crashed`,
        error instanceof Error ? error.stack : String(error),
      );
      await this.state.transition(execution, ExecutionStatus.FAILED, {
        error: 'Unexpected engine error',
        finishedAt: new Date(),
      });
    }
  }

  private async start(execution: Execution): Promise<void> {
    const started = await this.state.transition(
      execution,
      ExecutionStatus.RUNNING,
      { startedAt: new Date() },
    );

    if (!started) {
      return;
    }

    const planStep = await this.state.startStep(execution.id, 0, StepType.PLAN);
    const toolCalls = this.planner.plan(execution.task);
    await this.state.finishStep(planStep, StepStatus.COMPLETED, {
      output: { toolCalls },
    });

    await this.executeFrom(execution, toolCalls, 0);
  }

  private async resume(execution: Execution): Promise<void> {
    const steps = await this.stepsRepository.find({
      where: { executionId: execution.id },
      order: { position: 'ASC' },
    });
    const waitingStep = steps.find(
      (step) => step.status === StepStatus.WAITING_FOR_APPROVAL,
    );

    if (!waitingStep) {
      return;
    }

    const approval = await this.approvals.findForStep(waitingStep.id);

    if (!approval || approval.status === ApprovalStatus.PENDING) {
      return;
    }

    const resumed = await this.state.transition(
      execution,
      ExecutionStatus.RUNNING,
    );

    if (!resumed) {
      return;
    }

    const { toolCalls } = steps[0].output as { toolCalls: PlannedToolCall[] };
    const toolIndex = waitingStep.position - 1;

    if (approval.status === ApprovalStatus.APPROVED) {
      const outcome = await this.executeToolCall(
        execution,
        waitingStep,
        toolCalls[toolIndex],
        true,
      );

      if (outcome !== 'completed') {
        return;
      }
    } else {
      await this.state.finishStep(waitingStep, StepStatus.SKIPPED, {
        error: 'Rejected by user',
      });
    }

    await this.executeFrom(execution, toolCalls, toolIndex + 1);
  }

  private async executeFrom(
    execution: Execution,
    toolCalls: PlannedToolCall[],
    fromIndex: number,
  ): Promise<void> {
    for (let index = fromIndex; index < toolCalls.length; index++) {
      if (!(await this.isStillRunning(execution))) {
        return;
      }

      const step = await this.state.startStep(
        execution.id,
        index + 1,
        StepType.TOOL_CALL,
        toolCalls[index],
      );
      const outcome = await this.executeToolCall(
        execution,
        step,
        toolCalls[index],
        false,
      );

      if (outcome !== 'completed') {
        return;
      }
    }

    if (!(await this.isStillRunning(execution))) {
      return;
    }

    const result = `Completed ${toolCalls.length} tool calls.`;
    const finalStep = await this.state.startStep(
      execution.id,
      toolCalls.length + 1,
      StepType.FINAL_ANSWER,
    );
    await this.state.finishStep(finalStep, StepStatus.COMPLETED, {
      output: { result },
    });
    await this.state.transition(execution, ExecutionStatus.COMPLETED, {
      result,
      finishedAt: new Date(),
    });
  }

  private async executeToolCall(
    execution: Execution,
    step: ExecutionStep,
    toolCall: PlannedToolCall,
    approved: boolean,
  ): Promise<ToolCallOutcome> {
    for (let attempt = step.attempt; ; attempt++) {
      try {
        const result = await this.toolExecutor.execute({
          agentId: execution.agentId,
          ...toolCall,
          approved,
        });

        if (result.status === 'approval_required') {
          await this.approvals.request(execution, step, toolCall);
          return 'paused';
        }

        await this.state.finishStep(step, StepStatus.COMPLETED, {
          output: result.output as Record<string, unknown>,
        });
        return 'completed';
      } catch (error) {
        if (!(error instanceof ToolExecutionError)) {
          throw error;
        }

        const reason = `${error.code}: ${error.message}`;

        if (error.retryable && attempt < MAX_TOOL_ATTEMPTS) {
          await this.state.recordRetry(
            step,
            attempt + 1,
            `Attempt ${attempt} failed: ${reason}`,
          );
          await sleep(RETRY_DELAY_MS * attempt);

          if (!(await this.isStillRunning(execution))) {
            await this.state.finishStep(step, StepStatus.SKIPPED);
            return 'cancelled';
          }

          continue;
        }

        await this.state.finishStep(step, StepStatus.FAILED, {
          error:
            attempt > 1
              ? `Failed after ${attempt} attempts: ${reason}`
              : reason,
        });
        await this.state.transition(execution, ExecutionStatus.FAILED, {
          error: error.message,
          finishedAt: new Date(),
        });
        return 'failed';
      }
    }
  }

  private async isStillRunning(execution: Execution): Promise<boolean> {
    return (
      (await this.state.getStatus(execution.id)) === ExecutionStatus.RUNNING
    );
  }
}
