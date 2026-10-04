import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity.js';
import { User } from '../users/entities/user.entity.js';


export function createDataSourceOptions(url: string): DataSourceOptions {
  return {
    type: 'postgres',
    url,
    entities: [Agent, User],
    migrations: [join(import.meta.dirname, 'migrations', '*.js')],
    synchronize: false,
  };
}
