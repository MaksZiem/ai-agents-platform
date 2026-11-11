import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ExecutionStatus } from '../executions/execution-status.js';
import {
  EXECUTION_UPDATED,
  type ExecutionUpdatedEvent,
} from './execution-events.js';

@Injectable()
export class CancellationRegistry {
  private readonly controllers = new Map<string, AbortController>();

  register(executionId: string): AbortSignal {
    const controller = new AbortController();
    this.controllers.set(executionId, controller);
    return controller.signal;
  }

  release(executionId: string, signal: AbortSignal): void {
    if (this.controllers.get(executionId)?.signal === signal) {
      this.controllers.delete(executionId);
    }
  }

  signalFor(executionId: string): AbortSignal | undefined {
    return this.controllers.get(executionId)?.signal;
  }

  isCancelled(executionId: string): boolean {
    return this.controllers.get(executionId)?.signal.aborted ?? false;
  }

  @OnEvent(EXECUTION_UPDATED)
  handleExecutionUpdated({ executionId, status }: ExecutionUpdatedEvent) {
    if (status === ExecutionStatus.CANCELLED) {
      this.controllers.get(executionId)?.abort();
    }
  }
}
