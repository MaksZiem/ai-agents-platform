import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { ExecutionStep } from '../executions/entities/execution-step.entity.js';
import { Execution } from '../executions/entities/execution.entity.js';
import {
  canTransition,
  ExecutionStatus,
} from '../executions/execution-status.js';
import { StepStatus, StepType } from '../executions/execution-step-enums.js';
import {
  EXECUTION_UPDATED,
  type ExecutionUpdatedEvent,
  STEP_UPDATED,
  type StepUpdatedEvent,
} from './execution-events.js';
import type { LlmUsage } from './planner.js';

type TransitionChanges = Partial<
  Pick<Execution, 'result' | 'error' | 'startedAt' | 'finishedAt'>
>;

type StepResult = Partial<Pick<ExecutionStep, 'output' | 'error' | 'type'>>;

@Injectable()
export class ExecutionStateManager {
  constructor(
    @InjectRepository(Execution)
    private readonly executionsRepository: Repository<Execution>,
    @InjectRepository(ExecutionStep)
    private readonly stepsRepository: Repository<ExecutionStep>,
    private readonly events: EventEmitter2,
  ) {}

  async transition(
    execution: Pick<Execution, 'id' | 'status'>,
    to: ExecutionStatus,
    changes: TransitionChanges = {},
    manager: EntityManager = this.executionsRepository.manager,
  ): Promise<boolean> {
    if (!canTransition(execution.status, to)) {
      return false;
    }

    const result = await manager.update(
      Execution,
      { id: execution.id, status: execution.status },
      { ...changes, status: to },
    );

    if (result.affected !== 1) {
      return false;
    }

    execution.status = to;
    this.events.emit(EXECUTION_UPDATED, {
      executionId: execution.id,
      status: to,
      result: changes.result,
      error: changes.error,
    } satisfies ExecutionUpdatedEvent);
    return true;
  }

  async getStatus(executionId: string): Promise<ExecutionStatus | null> {
    const execution = await this.executionsRepository.findOne({
      where: { id: executionId },
      select: { id: true, status: true },
    });

    return execution?.status ?? null;
  }

  async startStep(
    executionId: string,
    position: number,
    type: StepType,
    details: Pick<Partial<ExecutionStep>, 'toolName' | 'input'> = {},
  ): Promise<ExecutionStep> {
    const step = this.stepsRepository.create({
      executionId,
      position,
      type,
      ...details,
      status: StepStatus.RUNNING,
      attempt: 1,
      startedAt: new Date(),
    });

    await this.stepsRepository.save(step);
    this.emitStep(step);
    return step;
  }

  async finishStep(
    step: ExecutionStep,
    status: StepStatus.COMPLETED | StepStatus.FAILED | StepStatus.SKIPPED,
    result: StepResult = {},
  ): Promise<void> {
    Object.assign(step, result, { status, finishedAt: new Date() });
    await this.stepsRepository.save(step);
    this.emitStep(step);
  }

  async recordRetry(
    step: ExecutionStep,
    attempt: number,
    error: string,
  ): Promise<void> {
    step.attempt = attempt;
    step.error = error;
    await this.stepsRepository.save(step);
    this.emitStep(step);
  }

  async recordLlmUsage(executionId: string, usage: LlmUsage): Promise<void> {
    await this.executionsRepository.manager.transaction(async (manager) => {
      const where = { id: executionId };
      await manager.increment(Execution, where, 'llmCalls', 1);
      await manager.increment(
        Execution,
        where,
        'inputTokens',
        usage.inputTokens,
      );
      await manager.increment(
        Execution,
        where,
        'outputTokens',
        usage.outputTokens,
      );
    });
  }

  async interruptRunningSteps(executionId: string): Promise<void> {
    const steps = await this.stepsRepository.findBy({
      executionId,
      status: StepStatus.RUNNING,
    });

    for (const step of steps) {
      await this.finishStep(step, StepStatus.FAILED, {
        error: 'Interrupted: the worker stopped while this step was running',
      });
    }
  }

  async skipUnfinishedSteps(executionId: string): Promise<void> {
    await this.stepsRepository.update(
      {
        executionId,
        status: In([StepStatus.PENDING, StepStatus.WAITING_FOR_APPROVAL]),
      },
      { status: StepStatus.SKIPPED, finishedAt: new Date() },
    );
  }

  async pauseStep(
    step: ExecutionStep,
    manager: EntityManager = this.stepsRepository.manager,
  ): Promise<void> {
    step.status = StepStatus.WAITING_FOR_APPROVAL;
    await manager.save(step);
    this.emitStep(step);
  }

  private emitStep(step: ExecutionStep): void {
    this.events.emit(STEP_UPDATED, {
      executionId: step.executionId,
      step,
    } satisfies StepUpdatedEvent);
  }
}
