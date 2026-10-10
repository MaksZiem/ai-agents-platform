import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentPermission } from '../agents/entities/agent-permission.entity.js';
import { AgentTool } from '../agents/entities/agent-tool.entity.js';
import { ExecutionStep } from '../executions/entities/execution-step.entity.js';
import { Execution } from '../executions/entities/execution.entity.js';
import { ToolsModule } from '../tools/tools.module.js';
import { EXECUTIONS_QUEUE } from './execution-queue.js';
import { ExecutionRunner } from './execution-runner.service.js';
import { ExecutionScheduler } from './execution-scheduler.service.js';
import { ExecutionStateManager } from './execution-state-manager.service.js';
import { ExecutionsProcessor } from './executions.processor.js';
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
    BullModule.registerQueue({ name: EXECUTIONS_QUEUE }),
    ToolsModule,
  ],
  providers: [
    ToolExecutor,
    ExecutionStateManager,
    MockPlanner,
    ExecutionRunner,
    ExecutionScheduler,
    ExecutionsProcessor,
  ],
  exports: [ExecutionStateManager, ExecutionScheduler],
})
export class EngineModule {}
