import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExecutionStep } from '../../executions/entities/execution-step.entity.js';
import { Execution } from '../../executions/entities/execution.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { ApprovalStatus } from '../approval-status.js';

@Entity('approvals')
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  executionId: string;

  @ManyToOne(() => Execution, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'executionId' })
  execution: Execution;

  @Column({ unique: true })
  stepId: string;

  @ManyToOne(() => ExecutionStep, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stepId' })
  step: ExecutionStep;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  toolName: string;

  @Column({ type: 'jsonb' })
  input: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({ type: 'timestamptz', nullable: true })
  decidedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
