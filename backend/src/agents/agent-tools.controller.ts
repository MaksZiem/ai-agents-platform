import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { AgentToolsService } from './agent-tools.service.js';
import { EnableAgentToolDto } from './dto/enable-agent-tool.dto.js';

@Controller('agents/:agentId/tools')
export class AgentToolsController {
  constructor(private readonly agentToolsService: AgentToolsService) {}

  @Get()
  findAll(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agentToolsService.findAll(agentId, user.sub);
  }

  @Put(':toolName')
  enable(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('toolName') toolName: string,
    @Body() dto: EnableAgentToolDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agentToolsService.enable(agentId, toolName, dto, user.sub);
  }

  @Delete(':toolName')
  @HttpCode(HttpStatus.NO_CONTENT)
  disable(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('toolName') toolName: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agentToolsService.disable(agentId, toolName, user.sub);
  }
}
