import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsModule } from '../agents/agents.module.js';
import { AgentKnowledgeController } from './agent-knowledge.controller.js';
import { AgentDocument } from './entities/agent-document.entity.js';
import { DocumentChunk } from './entities/document-chunk.entity.js';
import { KnowledgeDocument } from './entities/knowledge-document.entity.js';
import { KnowledgeController } from './knowledge.controller.js';
import { KnowledgeService } from './knowledge.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([KnowledgeDocument, DocumentChunk, AgentDocument]),
    AgentsModule,
  ],
  controllers: [KnowledgeController, AgentKnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
