import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Approval } from '../../approvals/entities/approval.entity.js';
import { Execution } from '../../executions/entities/execution.entity.js';

export class DayActivityDto {
  @ApiProperty({ example: '2026-11-17' })
  date: string;

  completed: number;
  failed: number;
  cancelled: number;
  active: number;
}

export class UsageSummaryDto {
  executions: number;
  completed: number;
  failed: number;
  tokens: number;
  llmCalls: number;

  @ApiPropertyOptional({ type: Number, nullable: true })
  avgDurationMs: number | null;

  retries: number;
}

export class ToolUsageDto {
  toolName: string;
  calls: number;
  failed: number;
}

export class UsageQuotaDto {
  tokensToday: number;
  dailyTokenLimit: number;
  tokenBudgetPerExecution: number;
  maxConcurrentExecutions: number;
}

export class DashboardAttentionDto {
  @ApiProperty({
    description: 'Najstarsze oczekujące akceptacje',
    type: () => Approval,
    isArray: true,
  })
  approvals: Approval[];

  @ApiProperty({
    description: 'Wykonania zakończone błędem w ciągu ostatnich 24 godzin',
    type: () => Execution,
    isArray: true,
  })
  failures: Execution[];
}

export class DashboardSummaryDto {
  @ApiProperty({ description: 'Liczba agentów' })
  agents: number;

  @ApiProperty({ description: 'Liczba zadań uruchomionych dzisiaj' })
  tasksToday: number;

  running: number;
  waitingForApproval: number;

  @ApiProperty({ type: () => Execution, isArray: true })
  recentExecutions: Execution[];

  @ApiProperty({
    description: 'Aktywność z ostatnich 14 dni',
    type: () => DayActivityDto,
    isArray: true,
  })
  activity: DayActivityDto[];

  @ApiProperty({
    description: 'Zużycie z ostatnich 7 dni',
    type: () => UsageSummaryDto,
  })
  usage: UsageSummaryDto;

  @ApiProperty({ type: () => ToolUsageDto, isArray: true })
  topTools: ToolUsageDto[];

  @ApiProperty({ type: () => UsageQuotaDto })
  quota: UsageQuotaDto;

  @ApiProperty({ type: () => DashboardAttentionDto })
  attention: DashboardAttentionDto;
}
