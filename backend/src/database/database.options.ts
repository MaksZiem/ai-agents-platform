import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity.js';
import { User } from '../users/entities/user.entity.js';
import { AgentPermission } from '../agents/entities/agent-permission.entity.js';
import { AgentTool } from '../agents/entities/agent-tool.entity.js';
import { Execution } from '../executions/entities/execution.entity.js';

export function createDataSourceOptions(url: string): DataSourceOptions {
  return {
    type: 'postgres',
    url,
    entities: [Agent, AgentTool, AgentPermission, Execution, User],
    migrations: [join(import.meta.dirname, 'migrations', '*.js')],
    synchronize: false,
  };
}
