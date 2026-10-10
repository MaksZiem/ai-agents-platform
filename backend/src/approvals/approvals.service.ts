import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExecutionScheduler } from '../engine/execution-scheduler.service.js';
import { ApprovalStatus } from './approval-status.js';
import { Approval } from './entities/approval.entity.js';

type Decision = ApprovalStatus.APPROVED | ApprovalStatus.REJECTED;

@Injectable()
export class ApprovalsService {
  constructor(
    @InjectRepository(Approval)
    private readonly approvalsRepository: Repository<Approval>,
    private readonly scheduler: ExecutionScheduler,
  ) {}

  findAll(userId: string, status?: ApprovalStatus): Promise<Approval[]> {
    return this.approvalsRepository.find({
      where: status ? { userId, status } : { userId },
      relations: { execution: { agent: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Approval> {
    const approval = await this.approvalsRepository.findOne({
      where: { id, userId },
      relations: { execution: { agent: true } },
    });

    if (!approval) {
      throw new NotFoundException(`Approval ${id} not found`);
    }

    return approval;
  }

  async decide(id: string, userId: string, decision: Decision) {
    const approval = await this.findOne(id, userId);

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new ConflictException(`Approval is already ${approval.status}`);
    }

    const result = await this.approvalsRepository.update(
      { id, status: ApprovalStatus.PENDING },
      { status: decision, decidedAt: new Date() },
    );

    if (result.affected !== 1) {
      throw new ConflictException('Approval was already decided');
    }

    try {
      await this.scheduler.schedule(
        approval.executionId,
        `${approval.executionId}-${approval.id}`,
      );
    } catch {
      await this.approvalsRepository.update(
        { id },
        { status: ApprovalStatus.PENDING, decidedAt: null },
      );
      throw new ServiceUnavailableException('Could not resume execution');
    }

    return this.findOne(id, userId);
  }
}
