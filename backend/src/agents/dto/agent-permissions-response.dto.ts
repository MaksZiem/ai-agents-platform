import { ApiProperty } from '@nestjs/swagger';
import {
  TOOL_ACTIONS,
  TOOL_RESOURCES,
} from '../../tools/dto/tool-response.dto.js';

export class PermissionActionDto {
  @ApiProperty({ enum: TOOL_ACTIONS, example: 'read' })
  action: string;

  @ApiProperty({ description: 'Czy agent ma to uprawnienie' })
  granted: boolean;
}

export class ResourcePermissionsDto {
  @ApiProperty({ enum: TOOL_RESOURCES, example: 'financial_data' })
  resource: string;

  @ApiProperty({ type: () => PermissionActionDto, isArray: true })
  actions: PermissionActionDto[];
}
