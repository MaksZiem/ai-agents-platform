import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../jwt-payload.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload =>
    context.switchToHttp().getRequest<{ user: JwtPayload }>().user,
);
