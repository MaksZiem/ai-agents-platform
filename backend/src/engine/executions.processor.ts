import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EXECUTIONS_QUEUE, type RunExecutionJob } from './execution-queue.js';
import { ExecutionRunner } from './execution-runner.service.js';

@Processor(EXECUTIONS_QUEUE, { concurrency: 5 })
export class ExecutionsProcessor extends WorkerHost {
  constructor(private readonly runner: ExecutionRunner) {
    super();
  }

  async process(job: Job<RunExecutionJob>): Promise<void> {
    await this.runner.run(job.data.executionId);
  }
}
