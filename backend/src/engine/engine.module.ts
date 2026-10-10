import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from '../agents/entities/agent.entity.js';
import { AgentPermission } from '../agents/entities/agent-permission.entity.js';
import { AgentTool } from '../agents/entities/agent-tool.entity.js';
import { Approval } from '../approvals/entities/approval.entity.js';
import { ExecutionStep } from '../executions/entities/execution-step.entity.js';
import { Execution } from '../executions/entities/execution.entity.js';
import { ToolsModule } from '../tools/tools.module.js';
import { ApprovalManager } from './approval-manager.service.js';
import { EXECUTIONS_QUEUE } from './execution-queue.js';
import { ExecutionRunner } from './execution-runner.service.js';
import { ExecutionScheduler } from './execution-scheduler.service.js';
import { ExecutionStateManager } from './execution-state-manager.service.js';
import { ExecutionsProcessor } from './executions.processor.js';
import { GeminiPlanner } from './gemini-planner.service.js';
import { Planner } from './planner.js';
import { ToolExecutor } from './tool-executor.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agent,
      AgentTool,
      AgentPermission,
      Execution,
      ExecutionStep,
      Approval,
    ]),
    BullModule.registerQueue({ name: EXECUTIONS_QUEUE }),
    ToolsModule,
  ],
  providers: [
    ToolExecutor,
    ExecutionStateManager,
    { provide: Planner, useClass: GeminiPlanner },
    ExecutionRunner,
    ExecutionScheduler,
    ExecutionsProcessor,
    ApprovalManager,
  ],
  exports: [ExecutionStateManager, ExecutionScheduler, ApprovalManager],
})
export class EngineModule {}
