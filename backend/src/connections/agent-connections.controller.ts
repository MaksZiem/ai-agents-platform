import {
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
import { ConnectionsService } from './connections.service.js';

@Controller('agents/:agentId/connections')
export class AgentConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get()
  findAll(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.connectionsService.findAllForAgent(agentId, user.sub);
  }

  @Put(':connectionId')
  attach(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('connectionId', ParseUUIDPipe) connectionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.connectionsService.attach(agentId, connectionId, user.sub);
  }

  @Delete(':connectionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  detach(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('connectionId', ParseUUIDPipe) connectionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.connectionsService.detach(agentId, connectionId, user.sub);
  }
}
