import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ description: 'Kod statusu HTTP', example: 404 })
  statusCode: number;

  @ApiPropertyOptional({
    description:
      'Stały kod błędu. Frontend tłumaczy komunikat na podstawie tego pola, a nie pola message',
  })
  code?: string;

  @ApiProperty({
    description:
      'Komunikat błędu po angielsku. Dla błędów walidacji (400) jest to tablica komunikatów, po jednym na każde niepoprawne pole',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'Resource not found',
  })
  message: string | string[];

  @ApiPropertyOptional({
    description: 'Wartości wstawiane do przetłumaczonego komunikatu',
    type: 'object',
    additionalProperties: { oneOf: [{ type: 'string' }, { type: 'number' }] },
    example: {},
  })
  params?: Record<string, string | number>;

  @ApiPropertyOptional({
    description: 'Nazwa błędu HTTP (zwracana przez wbudowane wyjątki Nest)',
    example: 'Not Found',
  })
  error?: string;
}

function errorDto(
  name: string,
  statusCode: number,
  error: string,
  message: string | string[],
  code?: string,
) {
  class Dto extends ErrorResponseDto {
    @ApiProperty({ example: statusCode })
    declare statusCode: number;

    @ApiPropertyOptional({
      example: code,
      description: code
        ? undefined
        : 'Dla tego statusu zwykle nieobecny (wbudowany wyjątek Nest)',
    })
    declare code?: string;

    @ApiProperty({
      oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
      example: message,
    })
    declare message: string | string[];

    @ApiPropertyOptional({ example: error })
    declare error?: string;
  }

  Object.defineProperty(Dto, 'name', { value: name });
  return Dto;
}

export const BadRequestErrorDto = errorDto(
  'BadRequestErrorDto',
  400,
  'Bad Request',
  ['name should not be empty', 'model must be a string'],
);

export const UnauthorizedErrorDto = errorDto(
  'UnauthorizedErrorDto',
  401,
  'Unauthorized',
  'Unauthorized',
);

export const ForbiddenErrorDto = errorDto(
  'ForbiddenErrorDto',
  403,
  'Forbidden',
  'Forbidden resource',
);

export const NotFoundErrorDto = errorDto(
  'NotFoundErrorDto',
  404,
  'Not Found',
  'Agent 3f1c9c2e-8a4b-4c1d-9e2f-1a2b3c4d5e6f not found',
);

export const ConflictErrorDto = errorDto(
  'ConflictErrorDto',
  409,
  'Conflict',
  'Connection name is already taken',
  'CONNECTION_NAME_TAKEN',
);

export const PayloadTooLargeErrorDto = errorDto(
  'PayloadTooLargeErrorDto',
  413,
  'Payload Too Large',
  'File too large',
);

export const TooManyRequestsErrorDto = errorDto(
  'TooManyRequestsErrorDto',
  429,
  'Too Many Requests',
  'Too many executions started, try again in a minute',
  'RATE_LIMIT_STARTS',
);

export const ServiceUnavailableErrorDto = errorDto(
  'ServiceUnavailableErrorDto',
  503,
  'Service Unavailable',
  'Could not schedule execution',
);
