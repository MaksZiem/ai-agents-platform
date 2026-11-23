import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
  type ValidationPipeOptions,
} from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { errorBody } from '../error-body.js';

function collectMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...collectMessages(error.children ?? []),
  ]);
}

export function createValidationPipe(options: ValidationPipeOptions = {}) {
  return new ValidationPipe({
    ...options,
    exceptionFactory: (errors) =>
      new BadRequestException(
        errorBody(
          HttpStatus.BAD_REQUEST,
          'VALIDATION_FAILED',
          collectMessages(errors),
        ),
      ),
  });
}
