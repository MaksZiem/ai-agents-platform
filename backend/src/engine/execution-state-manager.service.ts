import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ExecutionStep } from '../executions/entities/execution-step.entity.js';
import { Execution } from '../executions/entities/execution.entity.js';
import {
  canTransition,
  ExecutionStatus,
} from '../executions/execution-status.js';
import { StepStatus, StepType } from '../executions/execution-step-enums.js';

type TransitionChanges = Partial<
  Pick<Execution, 'result' | 'error' | 'startedAt' | 'finishedAt'>
>;

type StepResult = Partial<Pick<ExecutionStep, 'output' | 'error'>>;

@Injectable()
export class ExecutionStateManager {
  constructor(
    @InjectRepository(Execution)
    private readonly executionsRepository: Repository<Execution>,
    @InjectRepository(ExecutionStep)
    private readonly stepsRepository: Repository<ExecutionStep>,
  ) {}

  async transition(
    execution: Pick<Execution, 'id' | 'status'>,
    to: ExecutionStatus,
    changes: TransitionChanges = {},
  ): Promise<boolean> {
    if (!canTransition(execution.status, to)) {
      return false;
    }

    const result = await this.executionsRepository.update(
      { id: execution.id, status: execution.status },
      { ...changes, status: to },
    );

    if (result.affected !== 1) {
      return false;
    }

    execution.status = to;
    return true;
  }

  async getStatus(executionId: string): Promise<ExecutionStatus | null> {
    const execution = await this.executionsRepository.findOne({
      where: { id: executionId },
      select: { id: true, status: true },
    });

    return execution?.status ?? null;
  }

  startStep(
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
      startedAt: new Date(),
    });

    return this.stepsRepository.save(step);
  }

  async finishStep(
    step: ExecutionStep,
    status: StepStatus.COMPLETED | StepStatus.FAILED,
    result: StepResult = {},
  ): Promise<void> {
    Object.assign(step, result, { status, finishedAt: new Date() });
    await this.stepsRepository.save(step);
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

  async pauseStep(step: ExecutionStep): Promise<void> {
    step.status = StepStatus.WAITING_FOR_APPROVAL;
    await this.stepsRepository.save(step);
  }
}
