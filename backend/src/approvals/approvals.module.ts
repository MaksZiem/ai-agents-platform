import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EngineModule } from '../engine/engine.module.js';
import { ApprovalsController } from './approvals.controller.js';
import { ApprovalsService } from './approvals.service.js';
import { Approval } from './entities/approval.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Approval]), EngineModule],
  controllers: [ApprovalsController],
  providers: [ApprovalsService],
})
export class ApprovalsModule {}
