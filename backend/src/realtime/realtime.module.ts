import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Execution } from '../executions/entities/execution.entity.js';
import { ExecutionEventsGateway } from './execution-events.gateway.js';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Execution])],
  providers: [ExecutionEventsGateway],
})
export class RealtimeModule {}
