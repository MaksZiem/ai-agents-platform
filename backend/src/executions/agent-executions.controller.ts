import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { CreateExecutionDto } from './dto/create-execution.dto.js';
import { ExecutionsService } from './executions.service.js';

@Controller('agents/:agentId/executions')
export class AgentExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Post()
  create(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Body() dto: CreateExecutionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.executionsService.create(agentId, dto.task, user.sub);
  }

  @Get()
  findAll(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.executionsService.findAllForAgent(agentId, user.sub);
  }
}
