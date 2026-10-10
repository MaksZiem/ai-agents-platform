import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { EXECUTIONS_QUEUE, type RunExecutionJob } from './execution-queue.js';

const SCHEDULE_TIMEOUT_MS = 5_000;

@Injectable()
export class ExecutionScheduler {
  constructor(
    @InjectQueue(EXECUTIONS_QUEUE)
    private readonly queue: Queue<RunExecutionJob>,
  ) {}

  async schedule(executionId: string): Promise<void> {
    let timer: NodeJS.Timeout | undefined;

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error('Timed out while scheduling execution')),
        SCHEDULE_TIMEOUT_MS,
      );
    });

    const job = this.queue.add(
      'run',
      { executionId },
      {
        jobId: executionId,
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    );

    try {
      await Promise.race([job, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }
}
