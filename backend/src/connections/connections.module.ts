import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsModule } from '../agents/agents.module.js';
import { AgentConnectionsController } from './agent-connections.controller.js';
import { ConnectionsController } from './connections.controller.js';
import { ConnectionsService } from './connections.service.js';
import { AgentConnection } from './entities/agent-connection.entity.js';
import { Connection } from './entities/connection.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Connection, AgentConnection]),
    AgentsModule,
  ],
  controllers: [ConnectionsController, AgentConnectionsController],
  providers: [ConnectionsService],
  exports: [ConnectionsService],
})
export class ConnectionsModule {}
