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
import { KnowledgeDocument } from './knowledge-document.entity.js';

// Which documents an agent can search. One document can serve many agents.
@Entity('agent_documents')
@Unique(['agentId', 'documentId'])
export class AgentDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  agentId: string;

  @ManyToOne(() => Agent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: Agent;

  @Index()
  @Column()
  documentId: string;

  @ManyToOne(() => KnowledgeDocument, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentId' })
  document: KnowledgeDocument;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
