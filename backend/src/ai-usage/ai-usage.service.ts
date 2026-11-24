import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { errorBody } from '../common/error-body.js';
import type { Env } from '../config/env.js';
import { AiUsage } from './ai-usage.entity.js';

@Injectable()
export class AiUsageService {
  constructor(
    @InjectRepository(AiUsage) private readonly repo: Repository<AiUsage>,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async consume(userId: string): Promise<void> {
    const date = new Date().toISOString().slice(0, 10);
    await this.repo
      .createQueryBuilder()
      .insert()
      .values({ userId, date, count: 0 })
      .orIgnore()
      .execute();
    await this.repo.increment({ userId, date }, 'count', 1);
    const usage = await this.repo.findOneBy({ userId, date });
    const limit = this.config.get('AI_DAILY_LIMIT_PER_USER', { infer: true });
    if ((usage?.count ?? 0) > limit) {
      throw new HttpException(
        errorBody(
          HttpStatus.TOO_MANY_REQUESTS,
          'AI_DAILY_LIMIT',
          'Daily AI limit reached, try again tomorrow',
          { limit },
        ),
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
