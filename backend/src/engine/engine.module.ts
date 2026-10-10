import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentPermission } from '../agents/entities/agent-permission.entity.js';
import { AgentTool } from '../agents/entities/agent-tool.entity.js';
import { ExecutionStep } from '../executions/entities/execution-step.entity.js';
import { Execution } from '../executions/entities/execution.entity.js';
import { ToolsModule } from '../tools/tools.module.js';
import { ExecutionRunner } from './execution-runner.service.js';
import { ExecutionStateManager } from './execution-state-manager.service.js';
import { MockPlanner } from './mock-planner.service.js';
import { ToolExecutor } from './tool-executor.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentTool,
      AgentPermission,
      Execution,
      ExecutionStep,
    ]),
    ToolsModule,
  ],
  providers: [
    ToolExecutor,
    ExecutionStateManager,
    MockPlanner,
    ExecutionRunner,
  ],
  exports: [ExecutionStateManager, ExecutionRunner],
})
export class EngineModule {}
