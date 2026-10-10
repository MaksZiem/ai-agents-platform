import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Execution } from '../executions/entities/execution.entity.js';
import { ExecutionStatus } from '../executions/execution-status.js';
import { StepStatus, StepType } from '../executions/execution-step-enums.js';
import { ExecutionStateManager } from './execution-state-manager.service.js';
import { MockPlanner } from './mock-planner.service.js';
import { ToolExecutionError } from './tool-execution.error.js';
import { ToolExecutor } from './tool-executor.service.js';

@Injectable()
export class ExecutionRunner {
  private readonly logger = new Logger(ExecutionRunner.name);

  constructor(
    @InjectRepository(Execution)
    private readonly executionsRepository: Repository<Execution>,
    private readonly state: ExecutionStateManager,
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

    const started = await this.state.transition(
      execution,
      ExecutionStatus.RUNNING,
      { startedAt: new Date() },
    );

    if (!started) {
      return;
    }

    try {
      await this.process(execution);
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

  private async process(execution: Execution): Promise<void> {
    let position = 0;

    const planStep = await this.state.startStep(
      execution.id,
      position++,
      StepType.PLAN,
    );
    const toolCalls = this.planner.plan(execution.task);
    await this.state.finishStep(planStep, StepStatus.COMPLETED, {
      output: { toolCalls },
    });

    for (const toolCall of toolCalls) {
      if (!(await this.isStillRunning(execution))) {
        return;
      }

      const step = await this.state.startStep(
        execution.id,
        position++,
        StepType.TOOL_CALL,
        toolCall,
      );

      try {
        const result = await this.toolExecutor.execute({
          agentId: execution.agentId,
          ...toolCall,
        });

        if (result.status === 'approval_required') {
          await this.state.pauseStep(step);
          await this.state.transition(
            execution,
            ExecutionStatus.WAITING_FOR_APPROVAL,
          );
          return;
        }

        await this.state.finishStep(step, StepStatus.COMPLETED, {
          output: result.output as Record<string, unknown>,
        });
      } catch (error) {
        if (!(error instanceof ToolExecutionError)) {
          throw error;
        }

        await this.state.finishStep(step, StepStatus.FAILED, {
          error: `${error.code}: ${error.message}`,
        });
        await this.state.transition(execution, ExecutionStatus.FAILED, {
          error: error.message,
          finishedAt: new Date(),
        });
        return;
      }
    }

    if (!(await this.isStillRunning(execution))) {
      return;
    }

    const result = `Completed ${toolCalls.length} tool calls.`;
    const finalStep = await this.state.startStep(
      execution.id,
      position++,
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

  private async isStillRunning(execution: Execution): Promise<boolean> {
    return (
      (await this.state.getStatus(execution.id)) === ExecutionStatus.RUNNING
    );
  }
}
