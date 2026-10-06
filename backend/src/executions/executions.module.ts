import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionStep } from './entities/execution-step.entity.js';
import { Execution } from './entities/execution.entity.js';
import { ExecutionsController } from './executions.controller.js';
import { AgentExecutionsController } from './agent-executions.controller.js';
import { ExecutionsService } from './executions.service.js';
import { AgentsModule } from '../agents/agents.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Execution, ExecutionStep]), AgentsModule],
  controllers: [ExecutionsController, AgentExecutionsController],
  providers: [ExecutionsService],
})
export class ExecutionsModule {}
