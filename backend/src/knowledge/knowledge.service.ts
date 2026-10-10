import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, In, Repository } from 'typeorm';
import { AgentsService } from '../agents/agents.service.js';
import { chunkText } from './chunking.js';
import { AgentDocument } from './entities/agent-document.entity.js';
import { DocumentChunk } from './entities/document-chunk.entity.js';
import { KnowledgeDocument } from './entities/knowledge-document.entity.js';
import {
  type DocumentSearchHit,
  rankChunks,
  searchTerms,
} from './knowledge-search.js';
import { extractDocumentText } from './text-extraction.js';

// Upper bound of candidate chunks loaded for ranking in a single search.
const MAX_SEARCH_CANDIDATES = 200;

export interface UploadedDocumentFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(KnowledgeDocument)
    private readonly documentsRepository: Repository<KnowledgeDocument>,
    @InjectRepository(DocumentChunk)
    private readonly chunksRepository: Repository<DocumentChunk>,
    @InjectRepository(AgentDocument)
    private readonly agentDocumentsRepository: Repository<AgentDocument>,
    private readonly dataSource: DataSource,
    private readonly agentsService: AgentsService,
  ) {}

  async upload(
    userId: string,
    file: UploadedDocumentFile,
  ): Promise<KnowledgeDocument> {
    // Multer decodes file names as latin1; restore UTF-8 names like "budżet.pdf".
    const name = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const text = await extractDocumentText(name, file.buffer);
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      throw new BadRequestException('The file contains no text');
    }

    return this.dataSource.transaction(async (manager) => {
      const document = await manager.save(
        manager.create(KnowledgeDocument, {
          userId,
          name,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          characterCount: text.length,
          chunkCount: chunks.length,
        }),
      );

      await manager.save(
        chunks.map((content, position) =>
          manager.create(DocumentChunk, {
            documentId: document.id,
            position,
            content,
          }),
        ),
        { chunk: 500 },
      );

      return document;
    });
  }

  async findAll(userId: string) {
    const documents = await this.documentsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const links = await this.agentDocumentsRepository.find({
      where: { documentId: In(documents.map((document) => document.id)) },
      relations: { agent: true },
    });

    return documents.map((document) => ({
      ...document,
      agents: links
        .filter((link) => link.documentId === document.id)
        .map((link) => ({ id: link.agent.id, name: link.agent.name })),
    }));
  }

  async findOne(id: string, userId: string) {
    const document = await this.findDocument(id, userId);
    const [chunks, links] = await Promise.all([
      this.chunksRepository.find({
        where: { documentId: id },
        order: { position: 'ASC' },
      }),
      this.agentDocumentsRepository.find({
        where: { documentId: id },
        relations: { agent: true },
      }),
    ]);

    return {
      ...document,
      agents: links.map((link) => ({
        id: link.agent.id,
        name: link.agent.name,
      })),
      chunks: chunks.map(({ position, content }) => ({ position, content })),
    };
  }

  async remove(id: string, userId: string): Promise<void> {
    const document = await this.findDocument(id, userId);
    await this.documentsRepository.remove(document);
  }

  async findAllForAgent(agentId: string, userId: string) {
    await this.agentsService.findOne(agentId, userId);

    const links = await this.agentDocumentsRepository.find({
      where: { agentId },
      relations: { document: true },
      order: { createdAt: 'ASC' },
    });

    return links.map((link) => ({
      ...link.document,
      attachedAt: link.createdAt,
    }));
  }

  async attach(agentId: string, documentId: string, userId: string) {
    await this.agentsService.findOne(agentId, userId);
    const document = await this.findDocument(documentId, userId);

    const link =
      (await this.agentDocumentsRepository.findOneBy({
        agentId,
        documentId,
      })) ??
      (await this.agentDocumentsRepository.save(
        this.agentDocumentsRepository.create({ agentId, documentId }),
      ));

    return { ...document, attachedAt: link.createdAt };
  }

  async detach(agentId: string, documentId: string, userId: string) {
    await this.agentsService.findOne(agentId, userId);

    const link = await this.agentDocumentsRepository.findOneBy({
      agentId,
      documentId,
    });

    if (!link) {
      throw new NotFoundException(
        `Document ${documentId} is not attached to this agent`,
      );
    }

    await this.agentDocumentsRepository.remove(link);
  }

  // Keyword search over the documents attached to an agent. Used by the
  // searchDocuments tool, so it is scoped by agent, not by user.
  async search(
    agentId: string,
    query: string,
    limit: number,
  ): Promise<DocumentSearchHit[]> {
    const terms = searchTerms(query);
    const links = await this.agentDocumentsRepository.findBy({ agentId });

    if (terms.length === 0 || links.length === 0) {
      return [];
    }

    const documentIds = In(links.map((link) => link.documentId));
    // Terms only contain letters and digits, so there are no LIKE wildcards
    // to escape. An array of conditions means OR.
    const chunks = await this.chunksRepository.find({
      where: terms.map((term) => ({
        documentId: documentIds,
        content: ILike(`%${term}%`),
      })),
      relations: { document: true },
      take: MAX_SEARCH_CANDIDATES,
    });

    return rankChunks(chunks, terms, limit);
  }

  private async findDocument(
    id: string,
    userId: string,
  ): Promise<KnowledgeDocument> {
    const document = await this.documentsRepository.findOneBy({ id, userId });

    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return document;
  }
}
