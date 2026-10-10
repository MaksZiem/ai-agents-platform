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
import { ToolsService } from '../tools/tools.service.js';
import { ApprovalManager } from './approval-manager.service.js';
import { ExecutionStateManager } from './execution-state-manager.service.js';
import { ModelCallError } from './model-call.error.js';
import {
  type HistoryEntry,
  type ModelToolCall,
  type ModelTurn,
  Planner,
  type ToolResultStatus,
  type TurnContext,
} from './planner.js';
import { ToolExecutionError } from './tool-execution.error.js';
import { ToolExecutor } from './tool-executor.service.js';

type AgentContext = Omit<TurnContext, 'history'>;

type ToolCallOutcome = 'continue' | 'paused' | 'cancelled';

type AttemptResult<T> =
  | { kind: 'ok'; value: T }
  | { kind: 'failed'; reason: string }
  | { kind: 'cancelled' };

interface PendingToolCall {
  call: ModelToolCall;
  // The text the model wrote alongside its tool calls, shown as the
  // reason on approval requests.
  reason: string | null;
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1_000;
const MAX_MODEL_TURNS = 10;

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
      if (await this.prepare(execution)) {
        await this.loop(execution);
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

  // Brings the execution to RUNNING. Returns false when there is nothing to do.
  private async prepare(execution: Execution): Promise<boolean> {
    switch (execution.status) {
      case ExecutionStatus.QUEUED:
        return this.state.transition(execution, ExecutionStatus.RUNNING, {
          startedAt: new Date(),
        });
      case ExecutionStatus.WAITING_FOR_APPROVAL:
        return this.resolveApproval(execution);
      case ExecutionStatus.RUNNING:
        // BullMQ hands a job back after a worker crash. Steps that were
        // running are marked failed and the model decides how to go on.
        this.logger.warn(`Recovering execution ${execution.id}`);
        await this.state.interruptRunningSteps(execution.id);
        return true;
      default:
        return false;
    }
  }

  private async resolveApproval(execution: Execution): Promise<boolean> {
    const waitingStep = await this.stepsRepository.findOneBy({
      executionId: execution.id,
      status: StepStatus.WAITING_FOR_APPROVAL,
    });

    if (!waitingStep) {
      return false;
    }

    const approval = await this.approvals.findForStep(waitingStep.id);

    if (!approval || approval.status === ApprovalStatus.PENDING) {
      return false;
    }

    const resumed = await this.state.transition(
      execution,
      ExecutionStatus.RUNNING,
    );

    if (!resumed) {
      return false;
    }

    if (approval.status !== ApprovalStatus.APPROVED) {
      await this.state.finishStep(waitingStep, StepStatus.SKIPPED, {
        error: 'Rejected by user',
      });
      return true;
    }

    const outcome = await this.executeToolCall(
      execution,
      waitingStep,
      {
        call: { toolName: approval.toolName, input: approval.input },
        reason: approval.reason,
      },
      true,
    );

    return outcome === 'continue';
  }

  // The agent loop: run the tool calls of the last model turn one by one,
  // then ask the model what to do next, until it answers in text.
  // All state lives in the steps, so the loop can resume from any point.
  private async loop(execution: Execution): Promise<void> {
    const context = await this.loadAgentContext(execution);

    while (await this.isStillRunning(execution)) {
      const steps = await this.stepsRepository.find({
        where: { executionId: execution.id },
        order: { position: 'ASC' },
      });
      const pending = this.findPendingToolCall(steps);

      if (pending) {
        const step = await this.state.startStep(
          execution.id,
          steps.length,
          StepType.TOOL_CALL,
          { toolName: pending.call.toolName, input: pending.call.input },
        );
        const outcome = await this.executeToolCall(
          execution,
          step,
          pending,
          false,
        );

        if (outcome !== 'continue') {
          return;
        }

        continue;
      }

      const turns = steps.filter((step) => step.type === StepType.PLAN);

      if (turns.length >= MAX_MODEL_TURNS) {
        await this.state.transition(execution, ExecutionStatus.FAILED, {
          error: `Agent did not finish within ${MAX_MODEL_TURNS} model turns`,
          finishedAt: new Date(),
        });
        return;
      }

      if (await this.takeModelTurn(execution, steps, context)) {
        return;
      }
    }
  }

  // Returns true when the execution has ended.
  private async takeModelTurn(
    execution: Execution,
    steps: ExecutionStep[],
    context: AgentContext,
  ): Promise<boolean> {
    const step = await this.state.startStep(
      execution.id,
      steps.length,
      StepType.PLAN,
    );
    const result = await this.withRetries(execution, step, () =>
      this.planner.next({ ...context, history: this.buildHistory(steps) }),
    );

    if (result.kind === 'cancelled') {
      return true;
    }

    if (result.kind === 'failed') {
      await this.state.finishStep(step, StepStatus.FAILED, {
        error: result.reason,
      });
      await this.state.transition(execution, ExecutionStatus.FAILED, {
        error: 'Model call failed',
        finishedAt: new Date(),
      });
      return true;
    }

    const turn = result.value;

    if (turn.usage) {
      await this.state.recordLlmUsage(execution.id, turn.usage);
    }

    if (turn.toolCalls.length > 0) {
      await this.state.finishStep(step, StepStatus.COMPLETED, {
        output: {
          text: turn.text,
          toolCalls: turn.toolCalls,
          raw: turn.raw,
          usage: turn.usage,
        },
      });
      return false;
    }

    // The user may have cancelled while the model was writing the answer.
    if (!(await this.isStillRunning(execution))) {
      await this.state.finishStep(step, StepStatus.SKIPPED);
      return true;
    }

    const answer = turn.text ?? '';
    await this.state.finishStep(step, StepStatus.COMPLETED, {
      type: StepType.FINAL_ANSWER,
      output: { result: answer, usage: turn.usage },
    });
    await this.state.transition(execution, ExecutionStatus.COMPLETED, {
      result: answer,
      finishedAt: new Date(),
    });
    return true;
  }

  private async executeToolCall(
    execution: Execution,
    step: ExecutionStep,
    { call, reason }: PendingToolCall,
    approved: boolean,
  ): Promise<ToolCallOutcome> {
    const result = await this.withRetries(execution, step, () =>
      this.toolExecutor.execute({
        agentId: execution.agentId,
        toolName: call.toolName,
        input: call.input,
        approved,
      }),
    );

    if (result.kind === 'cancelled') {
      return 'cancelled';
    }

    if (result.kind === 'failed') {
      // Not fatal: the model sees the error on its next turn and can
      // fix its input, try something else or explain the problem.
      await this.state.finishStep(step, StepStatus.FAILED, {
        error: result.reason,
      });
      return 'continue';
    }

    if (result.value.status === 'approval_required') {
      await this.approvals.request(execution, step, {
        toolName: call.toolName,
        input: result.value.input as Record<string, unknown>,
        reason,
      });
      return 'paused';
    }

    await this.state.finishStep(step, StepStatus.COMPLETED, {
      output: result.value.output as Record<string, unknown>,
    });
    return 'continue';
  }

  // Runs `call`, retrying retryable errors with a growing delay.
  private async withRetries<T>(
    execution: Execution,
    step: ExecutionStep,
    call: () => Promise<T>,
  ): Promise<AttemptResult<T>> {
    for (let attempt = step.attempt; ; attempt++) {
      try {
        return { kind: 'ok', value: await call() };
      } catch (error) {
        if (
          !(error instanceof ToolExecutionError) &&
          !(error instanceof ModelCallError)
        ) {
          throw error;
        }

        const reason = `${error.code}: ${error.message}`;

        if (!error.retryable || attempt >= MAX_ATTEMPTS) {
          return {
            kind: 'failed',
            reason:
              attempt > 1
                ? `Failed after ${attempt} attempts: ${reason}`
                : reason,
          };
        }

        await this.state.recordRetry(
          step,
          attempt + 1,
          `Attempt ${attempt} failed: ${reason}`,
        );
        await sleep(RETRY_DELAY_MS * attempt);

        if (!(await this.isStillRunning(execution))) {
          await this.state.finishStep(step, StepStatus.SKIPPED);
          return { kind: 'cancelled' };
        }
      }
    }
  }

  // The next tool call of the last model turn that has no step yet.
  private findPendingToolCall(steps: ExecutionStep[]): PendingToolCall | null {
    const turnIndex = steps.findLastIndex(
      (step) =>
        step.type === StepType.PLAN && step.status === StepStatus.COMPLETED,
    );

    if (turnIndex === -1) {
      return null;
    }

    const turn = steps[turnIndex].output as unknown as ModelTurn;
    const done = steps
      .slice(turnIndex + 1)
      .filter((step) => step.type === StepType.TOOL_CALL).length;

    if (done >= turn.toolCalls.length) {
      return null;
    }

    return { call: turn.toolCalls[done], reason: turn.text };
  }

  private buildHistory(steps: ExecutionStep[]): HistoryEntry[] {
    const history: HistoryEntry[] = [];
    let calls: ModelToolCall[] = [];
    let index = 0;

    for (const step of steps) {
      if (step.type === StepType.PLAN && step.status === StepStatus.COMPLETED) {
        const turn = step.output as unknown as ModelTurn;
        history.push({ kind: 'model', turn });
        calls = turn.toolCalls;
        index = 0;
      } else if (step.type === StepType.TOOL_CALL && index < calls.length) {
        history.push({
          kind: 'tool',
          result: {
            call: calls[index],
            status: this.toResultStatus(step.status),
            output: step.output,
            error: step.error,
          },
        });
        index++;
      }
    }

    return history;
  }

  private toResultStatus(status: StepStatus): ToolResultStatus {
    switch (status) {
      case StepStatus.COMPLETED:
        return 'completed';
      case StepStatus.SKIPPED:
        return 'rejected';
      default:
        return 'failed';
    }
  }

  private async loadAgentContext(execution: Execution): Promise<AgentContext> {
    const agent = await this.agentsRepository.findOneByOrFail({
      id: execution.agentId,
    });
    const agentTools = await this.agentToolsRepository.findBy({
      agentId: execution.agentId,
    });
    const tools = agentTools.flatMap((agentTool) => {
      const tool = this.toolsService.find(agentTool.toolName);
      return tool ? [tool] : [];
    });

    return { task: execution.task, agent, tools };
  }

  private async isStillRunning(execution: Execution): Promise<boolean> {
    return (
      (await this.state.getStatus(execution.id)) === ExecutionStatus.RUNNING
    );
  }
}
