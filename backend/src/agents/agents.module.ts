import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolsModule } from '../tools/tools.module.js';
import { AgentPermissionsController } from './agent-permissions.controller.js';
import { AgentPermissionsService } from './agent-permissions.service.js';
import { AgentToolsController } from './agent-tools.controller.js';
import { AgentToolsService } from './agent-tools.service.js';
import { AgentsController } from './agents.controller.js';
import { AgentsService } from './agents.service.js';
import { AgentPermission } from './entities/agent-permission.entity.js';
import { AgentTool } from './entities/agent-tool.entity.js';
import { Agent } from './entities/agent.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agent, AgentTool, AgentPermission]),
    ToolsModule,
  ],
  controllers: [
    AgentsController,
    AgentToolsController,
    AgentPermissionsController,
  ],
  providers: [AgentsService, AgentToolsService, AgentPermissionsService],
  exports: [AgentsService],
})
export class AgentsModule {}
