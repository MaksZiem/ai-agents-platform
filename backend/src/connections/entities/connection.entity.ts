import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export const AUTH_TYPES = ['none', 'bearer', 'header'] as const;

export type AuthType = (typeof AUTH_TYPES)[number];

@Entity('connections')
@Unique(['userId', 'name'])
export class Connection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 2048 })
  baseUrl: string;

  @Column({ type: 'varchar', length: 16, default: 'none' })
  authType: AuthType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  authHeaderName: string | null;

  @Column({ type: 'text', nullable: true, select: false })
  secret: string | null;

  @Column({ type: 'boolean', default: false })
  hasSecret: boolean;

  @Column({ type: 'text', array: true, default: '{GET}' })
  allowedMethods: HttpMethod[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
