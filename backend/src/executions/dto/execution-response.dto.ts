import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Execution } from '../entities/execution.entity.js';
import { ExecutionStatus } from '../execution-status.js';

export class ExecutionMetricsDto {
  @ApiPropertyOptional({
    description:
      'Czas trwania w ms; null przed startem, rośnie w trakcie wykonania',
    type: Number,
    nullable: true,
  })
  durationMs: number | null;

  llmCalls: number;
  toolCalls: number;
  retries: number;
  failedSteps: number;
  approvalRequests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export class ExecutionDetailDto extends Execution {
  @ApiProperty({ type: () => ExecutionMetricsDto })
  metrics: ExecutionMetricsDto;
}

export class CurrentRunDto {
  @ApiProperty({ format: 'uuid' })
  executionId: string;

  @ApiProperty({ enum: ExecutionStatus })
  status: ExecutionStatus;

  task: string;

  @ApiPropertyOptional({ type: Date, nullable: true })
  startedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Nazwa bieżącego kroku (narzędzie, planowanie lub odpowiedź)',
    type: String,
    nullable: true,
    example: 'getTransactions',
  })
  step: string | null;
}

export class AgentActivityDto {
  @ApiProperty({ format: 'uuid' })
  agentId: string;

  totalRuns: number;
  completedRuns: number;
  failedRuns: number;

  @ApiPropertyOptional({ type: Date, nullable: true })
  lastRunAt: Date | null;

  activeRuns: number;

  @ApiPropertyOptional({
    description: 'Najnowsze trwające wykonanie agenta',
    type: () => CurrentRunDto,
    nullable: true,
  })
  current: CurrentRunDto | null;
}
