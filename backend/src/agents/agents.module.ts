import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolsModule } from '../tools/tools.module.js';
import { AgentToolsController } from './agent-tools.controller.js';
import { AgentToolsService } from './agent-tools.service.js';
import { AgentsController } from './agents.controller.js';
import { AgentsService } from './agents.service.js';
import { AgentTool } from './entities/agent-tool.entity.js';
import { Agent } from './entities/agent.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, AgentTool]), ToolsModule],
  controllers: [AgentsController, AgentToolsController],
  providers: [AgentsService, AgentToolsService],
})
export class AgentsModule {}
