import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentPermission } from '../agents/entities/agent-permission.entity.js';
import { AgentTool } from '../agents/entities/agent-tool.entity.js';
import { ToolsModule } from '../tools/tools.module.js';
import { ToolExecutor } from './tool-executor.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentTool, AgentPermission]),
    ToolsModule,
  ],
  providers: [ToolExecutor],
  exports: [ToolExecutor],
})
export class EngineModule {}
