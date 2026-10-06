import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { AgentPermissionsService } from './agent-permissions.service.js';
import { UpdateAgentPermissionsDto } from './dto/update-agent-permissions.dto.js';

@Controller('agents/:agentId/permissions')
export class AgentPermissionsController {
  constructor(
    private readonly agentPermissionsService: AgentPermissionsService,
  ) {}

  @Get()
  findAll(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agentPermissionsService.findAll(agentId, user.sub);
  }

  @Put()
  replace(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Body() dto: UpdateAgentPermissionsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agentPermissionsService.replace(
      agentId,
      dto.permissions,
      user.sub,
    );
  }
}
