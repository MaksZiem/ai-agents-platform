import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from '../agents/entities/agent.entity.js';
import { Execution } from '../executions/entities/execution.entity.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, Execution])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
