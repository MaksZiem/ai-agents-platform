import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { ToolAction, ToolResource } from '../../tools/tool-definition.js';
import { Agent } from './agent.entity.js';

@Entity('agent_permissions')
@Unique(['agentId', 'resource', 'action'])
export class AgentPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  agentId: string;

  @ManyToOne(() => Agent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: Agent;

  @Column({ type: 'varchar' })
  resource: ToolResource;

  @Column({ type: 'varchar' })
  action: ToolAction;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
