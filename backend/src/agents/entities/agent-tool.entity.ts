import { ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Agent } from './agent.entity.js';

@Entity('agent_tools')
@Unique(['agentId', 'toolName'])
export class AgentTool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  agentId: string;

  @ApiHideProperty()
  @ManyToOne(() => Agent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: Agent;

  @Column()
  toolName: string;

  @Column({ default: false })
  requiresApproval: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
