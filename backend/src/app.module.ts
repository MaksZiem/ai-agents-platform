import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsModule } from './agents/agents.module.js';
import { validateEnv, type Env } from './config/env.js';
import { parseRedisUrl } from './config/redis.js';
import { createDataSourceOptions } from './database/database.options.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ToolsModule } from './tools/tools.module.js';
import { ExecutionsModule } from './executions/executions.module.js';
import { ApprovalsModule } from './approvals/approvals.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { KnowledgeModule } from './knowledge/knowledge.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        createDataSourceOptions(config.get('DATABASE_URL', { infer: true })),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        connection: parseRedisUrl(config.get('REDIS_URL', { infer: true })),
      }),
    }),
    EventEmitterModule.forRoot(),
    HealthModule,
    AgentsModule,
    AuthModule,
    ToolsModule,
    ExecutionsModule,
    ApprovalsModule,
    RealtimeModule,
    DashboardModule,
    KnowledgeModule,
  ],
})
export class AppModule {}
