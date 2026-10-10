import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ApprovalStatus } from '../approvals/approval-status.js';
import { Approval } from '../approvals/entities/approval.entity.js';
import { ExecutionStep } from '../executions/entities/execution-step.entity.js';
import { Execution } from '../executions/entities/execution.entity.js';
import { ExecutionStatus } from '../executions/execution-status.js';
import { ExecutionStateManager } from './execution-state-manager.service.js';
import type { PlannedToolCall } from './mock-planner.service.js';

@Injectable()
export class ApprovalManager {
  constructor(
    @InjectRepository(Approval)
    private readonly approvalsRepository: Repository<Approval>,
    private readonly dataSource: DataSource,
    private readonly state: ExecutionStateManager,
  ) {}

  request(
    execution: Execution,
    step: ExecutionStep,
    toolCall: PlannedToolCall,
  ): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const paused = await this.state.transition(
        execution,
        ExecutionStatus.WAITING_FOR_APPROVAL,
        {},
        manager,
      );

      if (!paused) {
        return false;
      }

      await this.state.pauseStep(step, manager);
      await manager.save(
        manager.create(Approval, {
          executionId: execution.id,
          stepId: step.id,
          userId: execution.userId,
          toolName: toolCall.toolName,
          input: toolCall.input,
        }),
      );

      return true;
    });
  }

  findForStep(stepId: string): Promise<Approval | null> {
    return this.approvalsRepository.findOneBy({ stepId });
  }

  async cancelPending(executionId: string): Promise<void> {
    await this.approvalsRepository.update(
      { executionId, status: ApprovalStatus.PENDING },
      { status: ApprovalStatus.CANCELLED, decidedAt: new Date() },
    );
  }
}
