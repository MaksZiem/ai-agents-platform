import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiLimitGuard } from './ai-limit.guard.js';
import { AiUsage } from './ai-usage.entity.js';
import { AiUsageService } from './ai-usage.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([AiUsage])],
  providers: [AiUsageService, AiLimitGuard],
  exports: [AiUsageService, AiLimitGuard],
})
export class AiUsageModule {}
