import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { Queue } from 'bullmq';
import { withTimeout } from '../common/with-timeout.js';
import { EXECUTIONS_QUEUE } from '../engine/execution-queue.js';

const PING_TIMEOUT_MS = 2_000;

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @InjectQueue(EXECUTIONS_QUEUE)
    private readonly queue: Queue,
  ) {}

  async pingCheck(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await withTimeout(
        this.queue.getWaitingCount(),
        PING_TIMEOUT_MS,
        'Redis did not respond',
      );
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
