import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Agent } from '../../agents/entities/agent.entity.js';
import { Connection } from './connection.entity.js';

@Entity('agent_connections')
@Unique(['agentId', 'connectionId'])
export class AgentConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  agentId: string;

  @ManyToOne(() => Agent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: Agent;

  @Index()
  @Column()
  connectionId: string;

  @ManyToOne(() => Connection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'connectionId' })
  connection: Connection;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
