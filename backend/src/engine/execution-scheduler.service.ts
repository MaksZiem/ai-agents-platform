import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { withTimeout } from '../common/with-timeout.js';
import { EXECUTIONS_QUEUE, type RunExecutionJob } from './execution-queue.js';

const SCHEDULE_TIMEOUT_MS = 5_000;

@Injectable()
export class ExecutionScheduler {
  constructor(
    @InjectQueue(EXECUTIONS_QUEUE)
    private readonly queue: Queue<RunExecutionJob>,
  ) {}

  async schedule(executionId: string, jobId = executionId): Promise<void> {
    await withTimeout(
      this.queue.add(
        'run',
        { executionId },
        {
          jobId,
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      ),
      SCHEDULE_TIMEOUT_MS,
      'Timed out while scheduling execution',
    );
  }
}
