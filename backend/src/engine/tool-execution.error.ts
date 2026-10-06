export type ToolExecutionErrorCode =
  | 'TOOL_NOT_FOUND'
  | 'TOOL_NOT_ENABLED'
  | 'PERMISSION_DENIED'
  | 'INVALID_INPUT'
  | 'INVALID_OUTPUT'
  | 'EXECUTION_FAILED';

export class ToolExecutionError extends Error {
  constructor(
    readonly code: ToolExecutionErrorCode,
    message: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = 'ToolExecutionError';
  }
}
