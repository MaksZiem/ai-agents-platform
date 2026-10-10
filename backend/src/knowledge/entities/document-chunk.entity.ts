import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { KnowledgeDocument } from './knowledge-document.entity.js';

@Entity('document_chunks')
@Unique(['documentId', 'position'])
export class DocumentChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  documentId: string;

  @ManyToOne(() => KnowledgeDocument, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentId' })
  document: KnowledgeDocument;

  @Column({ type: 'int' })
  position: number;

  @Column({ type: 'text' })
  content: string;
}
