import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TOOL_CATEGORIES,
  ToolPermissionDto,
} from '../../tools/dto/tool-response.dto.js';

export class AgentToolResponseDto {
  @ApiProperty({ example: 'sendEmail' })
  toolName: string;

  summary: string;

  @ApiProperty({ enum: TOOL_CATEGORIES })
  category: string;

  description: string;

  @ApiPropertyOptional({ type: () => ToolPermissionDto, nullable: true })
  permission: ToolPermissionDto | null;

  @ApiProperty({
    description:
      'Czy wywołanie wymaga akceptacji (z definicji narzędzia lub ustawienia agenta)',
  })
  requiresApproval: boolean;

  @ApiProperty({ description: 'Kiedy narzędzie zostało włączone dla agenta' })
  enabledAt: Date;
}
