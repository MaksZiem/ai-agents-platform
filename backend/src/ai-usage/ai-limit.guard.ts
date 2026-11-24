import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { AiUsageService } from './ai-usage.service.js';

@Injectable()
export class AiLimitGuard implements CanActivate {
  constructor(private readonly aiUsage: AiUsageService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    if (request.user) {
      await this.aiUsage.consume(request.user.sub);
    }
    return true;
  }
}
