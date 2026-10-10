export type ModelCallErrorCode =
  'RATE_LIMITED' | 'MODEL_UNAVAILABLE' | 'MODEL_ERROR' | 'EMPTY_RESPONSE';

export class ModelCallError extends Error {
  constructor(
    readonly code: ModelCallErrorCode,
    message: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = 'ModelCallError';
  }
}
