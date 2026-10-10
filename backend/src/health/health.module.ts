import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { EXECUTIONS_QUEUE } from '../engine/execution-queue.js';
import { HealthController } from './health.controller.js';
import { RedisHealthIndicator } from './redis.health.js';

@Module({
  imports: [
    TerminusModule,
    BullModule.registerQueue({ name: EXECUTIONS_QUEUE }),
  ],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {}
