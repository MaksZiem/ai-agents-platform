import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  AUTH_TYPES,
  type AuthType,
  HTTP_METHODS,
  type HttpMethod,
} from '../entities/connection.entity.js';

export class CreateConnectionDto {
  @IsString()
  @Matches(/^[a-z][a-z0-9_-]{0,63}$/, {
    message:
      'name must start with a letter and use lowercase letters, digits, - or _',
  })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  @MaxLength(2048)
  baseUrl: string;

  @IsIn(AUTH_TYPES)
  authType: AuthType;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9-]{1,100}$/, {
    message: 'authHeaderName must be a valid HTTP header name',
  })
  authHeaderName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4096)
  secret?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(HTTP_METHODS, { each: true })
  allowedMethods: HttpMethod[];
}
