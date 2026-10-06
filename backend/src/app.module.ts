import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsModule } from './agents/agents.module.js';
import { validateEnv, type Env } from './config/env.js';
import { createDataSourceOptions } from './database/database.options.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ToolsModule } from './tools/tools.module.js';
import { ExecutionsModule } from './executions/executions.module.js';

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
    HealthModule,
    AgentsModule,
    AuthModule,
    ToolsModule,
    ExecutionsModule,
  ],
})
export class AppModule {}
