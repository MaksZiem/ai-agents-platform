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
import { KnowledgeService } from './knowledge.service.js';

@Controller('agents/:agentId/knowledge')
export class AgentKnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  findAll(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.knowledgeService.findAllForAgent(agentId, user.sub);
  }

  @Put(':documentId')
  attach(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.knowledgeService.attach(agentId, documentId, user.sub);
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  detach(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.knowledgeService.detach(agentId, documentId, user.sub);
  }
}
