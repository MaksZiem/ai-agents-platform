import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const TOOL_RESOURCES = [
  'financial_data',
  'documents',
  'reports',
  'email',
  'web',
  'connections',
] as const;

export const TOOL_ACTIONS = [
  'read',
  'search',
  'modify',
  'delete',
  'create',
  'send',
] as const;

export const TOOL_CATEGORIES = [
  'documents',
  'analysis',
  'web',
  'communication',
] as const;

export class ToolPermissionDto {
  @ApiProperty({ enum: TOOL_RESOURCES, example: 'financial_data' })
  resource: string;

  @ApiProperty({ enum: TOOL_ACTIONS, example: 'read' })
  action: string;
}

export class ToolResponseDto {
  @ApiProperty({ example: 'getTransactions' })
  name: string;

  @ApiProperty({ example: 'Pobiera transakcje z wybranego okresu' })
  summary: string;

  @ApiProperty({ enum: TOOL_CATEGORIES, example: 'analysis' })
  category: string;

  description: string;

  @ApiProperty({
    description: 'JSON Schema wejścia narzędzia',
    type: 'object',
    additionalProperties: true,
  })
  inputSchema: Record<string, unknown>;

  @ApiProperty({
    description: 'JSON Schema wyniku narzędzia',
    type: 'object',
    additionalProperties: true,
  })
  outputSchema: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Uprawnienie wymagane do użycia narzędzia',
    type: () => ToolPermissionDto,
    nullable: true,
  })
  permission: ToolPermissionDto | null;

  @ApiProperty({
    description: 'Czy narzędzie zawsze wymaga akceptacji człowieka',
  })
  requiresApproval: boolean;
}
