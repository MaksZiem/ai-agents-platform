import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ description: 'Kod statusu HTTP', example: 404 })
  statusCode: number;

  @ApiProperty({
    description:
      'Stały kod błędu. Frontend tłumaczy komunikat na podstawie tego pola, a nie pola message',
    example: 'NOT_FOUND',
  })
  code: string;

  @ApiProperty({
    description:
      'Komunikat błędu po angielsku. Dla błędów walidacji (400) jest to tablica komunikatów, po jednym na każde niepoprawne pole',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'Resource not found',
  })
  message: string | string[];

  @ApiProperty({
    description: 'Wartości wstawiane do przetłumaczonego komunikatu',
    type: 'object',
    additionalProperties: { oneOf: [{ type: 'string' }, { type: 'number' }] },
    example: {},
  })
  params: Record<string, string | number>;
}

function errorDto(
  name: string,
  statusCode: number,
  message: string | string[],
  code: string,
) {
  class Dto extends ErrorResponseDto {
    @ApiProperty({ example: statusCode })
    declare statusCode: number;

    @ApiProperty({ example: code })
    declare code: string;

    @ApiProperty({
      oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
      example: message,
    })
    declare message: string | string[];
  }

  Object.defineProperty(Dto, 'name', { value: name });
  return Dto;
}

export const BadRequestErrorDto = errorDto(
  'BadRequestErrorDto',
  400,
  ['name should not be empty', 'model must be a string'],
  'VALIDATION_FAILED',
);

export const UnauthorizedErrorDto = errorDto(
  'UnauthorizedErrorDto',
  401,
  'Unauthorized',
  'UNAUTHORIZED',
);

export const ForbiddenErrorDto = errorDto(
  'ForbiddenErrorDto',
  403,
  'Forbidden resource',
  'FORBIDDEN',
);

export const NotFoundErrorDto = errorDto(
  'NotFoundErrorDto',
  404,
  'Agent 3f1c9c2e-8a4b-4c1d-9e2f-1a2b3c4d5e6f not found',
  'NOT_FOUND',
);

export const ConflictErrorDto = errorDto(
  'ConflictErrorDto',
  409,
  'Connection name is already taken',
  'CONNECTION_NAME_TAKEN',
);

export const PayloadTooLargeErrorDto = errorDto(
  'PayloadTooLargeErrorDto',
  413,
  'File too large',
  'PAYLOAD_TOO_LARGE',
);

export const TooManyRequestsErrorDto = errorDto(
  'TooManyRequestsErrorDto',
  429,
  'Too many executions started, try again in a minute',
  'RATE_LIMIT_STARTS',
);

export const ServiceUnavailableErrorDto = errorDto(
  'ServiceUnavailableErrorDto',
  503,
  'Could not schedule execution',
  'SERVICE_UNAVAILABLE',
);
