import { ExecutionStatus } from '../executions/execution-status.js';
import { CancellationRegistry } from './cancellation-registry.service.js';

describe('CancellationRegistry', () => {
  it('aborts the signal when the execution is cancelled', () => {
    const registry = new CancellationRegistry();
    const signal = registry.register('execution-1');

    registry.handleExecutionUpdated({
      executionId: 'execution-1',
      status: ExecutionStatus.CANCELLED,
    });

    expect(signal.aborted).toBe(true);
    expect(registry.isCancelled('execution-1')).toBe(true);
  });

  it('ignores other status changes and other executions', () => {
    const registry = new CancellationRegistry();
    const signal = registry.register('execution-1');

    registry.handleExecutionUpdated({
      executionId: 'execution-1',
      status: ExecutionStatus.WAITING_FOR_APPROVAL,
    });
    registry.handleExecutionUpdated({
      executionId: 'execution-2',
      status: ExecutionStatus.CANCELLED,
    });

    expect(signal.aborted).toBe(false);
  });

  it('keeps a newer run registered when an older one is released', () => {
    const registry = new CancellationRegistry();
    const first = registry.register('execution-1');
    const second = registry.register('execution-1');

    registry.release('execution-1', first);

    expect(registry.signalFor('execution-1')).toBe(second);
  });
});
