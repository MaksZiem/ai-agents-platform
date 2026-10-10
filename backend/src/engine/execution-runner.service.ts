import { setTimeout as sleep } from 'node:timers/promises';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity.js';
import { AgentTool } from '../agents/entities/agent-tool.entity.js';
import { ApprovalStatus } from '../approvals/approval-status.js';
import { ExecutionStep } from '../executions/entities/execution-step.entity.js';
import { Execution } from '../executions/entities/execution.entity.js';
import { ExecutionStatus } from '../executions/execution-status.js';
import { StepStatus, StepType } from '../executions/execution-step-enums.js';
import { ApprovalManager } from './approval-manager.service.js';
import { ExecutionStateManager } from './execution-state-manager.service.js';
import {
  type AnswerContext,
  type AnswerResult,
  Planner,
  type PlannedToolCall,
  type PlanningContext,
  type PlanResult,
} from './planner.js';
import { ToolExecutionError } from './tool-execution.error.js';
import { ToolExecutor } from './tool-executor.service.js';
import { ToolsService } from '../tools/tools.service.js';

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
    @InjectRepository(Agent)
    private readonly agentsRepository: Repository<Agent>,
    @InjectRepository(AgentTool)
    private readonly agentToolsRepository: Repository<AgentTool>,
    private readonly state: ExecutionStateManager,
    private readonly approvals: ApprovalManager,
    private readonly planner: Planner,
    private readonly toolExecutor: ToolExecutor,
    private readonly toolsService: ToolsService,
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
    let plan: PlanResult;

    try {
      plan = await this.planner.plan(
        await this.buildPlanningContext(execution),
      );
    } catch (error) {
      await this.failModelStep(execution, planStep, 'Planning failed', error);
      return;
    }

    if (plan.usage) {
      await this.state.recordLlmUsage(execution.id, plan.usage);
    }

    await this.state.finishStep(planStep, StepStatus.COMPLETED, {
      output: { toolCalls: plan.toolCalls, usage: plan.usage },
    });

    await this.executeFrom(execution, plan.toolCalls, 0);
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

  private async buildPlanningContext(
    execution: Execution,
  ): Promise<PlanningContext> {
    const agent = await this.loadAgent(execution);
    const agentTools = await this.agentToolsRepository.findBy({
      agentId: execution.agentId,
    });
    const tools = agentTools.flatMap((agentTool) => {
      const tool = this.toolsService.find(agentTool.toolName);
      return tool ? [tool] : [];
    });

    return { task: execution.task, agent, tools };
  }

  private async buildAnswerContext(
    execution: Execution,
  ): Promise<AnswerContext> {
    const agent = await this.loadAgent(execution);
    const toolSteps = await this.stepsRepository.find({
      where: { executionId: execution.id, type: StepType.TOOL_CALL },
      order: { position: 'ASC' },
    });
    const results = toolSteps.map((step) => ({
      toolName: step.toolName ?? '',
      input: step.input,
      status: step.status,
      output: step.output,
      error: step.error,
    }));

    return { task: execution.task, agent, results };
  }

  private loadAgent(execution: Execution): Promise<Agent> {
    return this.agentsRepository.findOneByOrFail({ id: execution.agentId });
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

    await this.finish(execution, toolCalls.length + 1);
  }

  private async finish(execution: Execution, position: number): Promise<void> {
    const finalStep = await this.state.startStep(
      execution.id,
      position,
      StepType.FINAL_ANSWER,
    );

    let answer: AnswerResult;

    try {
      answer = await this.planner.answer(
        await this.buildAnswerContext(execution),
      );
    } catch (error) {
      await this.failModelStep(
        execution,
        finalStep,
        'Final answer failed',
        error,
      );
      return;
    }

    if (answer.usage) {
      await this.state.recordLlmUsage(execution.id, answer.usage);
    }

    // The user may have cancelled while the model was writing the answer.
    if (!(await this.isStillRunning(execution))) {
      await this.state.finishStep(finalStep, StepStatus.SKIPPED);
      return;
    }

    await this.state.finishStep(finalStep, StepStatus.COMPLETED, {
      output: { result: answer.answer, usage: answer.usage },
    });
    await this.state.transition(execution, ExecutionStatus.COMPLETED, {
      result: answer.answer,
      finishedAt: new Date(),
    });
  }

  // Model errors (timeout, bad key, quota, unknown model) are expected,
  // so they fail the step with a clear reason instead of crashing the engine.
  private async failModelStep(
    execution: Execution,
    step: ExecutionStep,
    reason: string,
    error: unknown,
  ): Promise<void> {
    const message = error instanceof Error ? error.message : String(error);
    await this.state.finishStep(step, StepStatus.FAILED, {
      error: `${reason}: ${message}`,
    });
    await this.state.transition(execution, ExecutionStatus.FAILED, {
      error: reason,
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
