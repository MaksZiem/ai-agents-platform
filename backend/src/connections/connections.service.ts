import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentsService } from '../agents/agents.service.js';
import type { Env } from '../config/env.js';
import { safeFetch } from '../web/safe-fetch.js';
import { CreateConnectionDto } from './dto/create-connection.dto.js';
import { UpdateConnectionDto } from './dto/update-connection.dto.js';
import { AgentConnection } from './entities/agent-connection.entity.js';
import {
  type AuthType,
  Connection,
  type HttpMethod,
} from './entities/connection.entity.js';
import { buildRequestUrl, RequestUrlError } from './request-url.js';
import { SecretCipher } from './secret-cipher.js';

export interface ConnectionRequest {
  connection: string;
  method: HttpMethod;
  path: string;
  body?: string;
}

export interface ConnectionResponse {
  connection: string;
  method: HttpMethod;
  url: string;
  status: number;
  contentType: string;
  body: string;
  truncated: boolean;
}

const REQUEST_TIMEOUT_MS = 20_000;
const MAX_RESPONSE_BYTES = 2_000_000;
const MAX_BODY_CHARACTERS = 20_000;
const RESERVED_HEADERS = new Set([
  'host',
  'content-length',
  'content-type',
  'transfer-encoding',
  'connection',
  'accept-encoding',
]);

@Injectable()
export class ConnectionsService {
  private readonly cipher: SecretCipher;

  constructor(
    @InjectRepository(Connection)
    private readonly connectionsRepository: Repository<Connection>,
    @InjectRepository(AgentConnection)
    private readonly agentConnectionsRepository: Repository<AgentConnection>,
    private readonly agentsService: AgentsService,
    config: ConfigService<Env, true>,
  ) {
    this.cipher = new SecretCipher(
      config.get('ENCRYPTION_KEY', { infer: true }),
    );
  }

  findAll(userId: string): Promise<Connection[]> {
    return this.connectionsRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Connection> {
    const connection = await this.connectionsRepository.findOneBy({
      id,
      userId,
    });

    if (!connection) {
      throw new NotFoundException(`Connection ${id} not found`);
    }

    return connection;
  }

  async create(dto: CreateConnectionDto, userId: string): Promise<Connection> {
    await this.assertNameFree(dto.name, userId);
    this.assertAuth(dto.authType, dto.authHeaderName, Boolean(dto.secret));

    const saved = await this.connectionsRepository.save(
      this.connectionsRepository.create({
        userId,
        name: dto.name,
        description: dto.description || null,
        baseUrl: dto.baseUrl,
        authType: dto.authType,
        authHeaderName: dto.authType === 'header' ? dto.authHeaderName : null,
        allowedMethods: dto.allowedMethods,
        ...this.secretColumns(dto.authType, dto.secret),
      }),
    );

    return this.findOne(saved.id, userId);
  }

  async update(
    id: string,
    dto: UpdateConnectionDto,
    userId: string,
  ): Promise<Connection> {
    const connection = await this.findOne(id, userId);

    if (dto.name && dto.name !== connection.name) {
      await this.assertNameFree(dto.name, userId);
    }

    const authType = dto.authType ?? connection.authType;
    const authHeaderName = dto.authHeaderName ?? connection.authHeaderName;
    const replacesSecret = Boolean(dto.secret);

    this.assertAuth(
      authType,
      authHeaderName ?? undefined,
      replacesSecret || connection.hasSecret,
    );

    await this.connectionsRepository.update(
      { id },
      {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && {
          description: dto.description || null,
        }),
        ...(dto.baseUrl !== undefined && { baseUrl: dto.baseUrl }),
        ...(dto.allowedMethods !== undefined && {
          allowedMethods: dto.allowedMethods,
        }),
        authType,
        authHeaderName: authType === 'header' ? authHeaderName : null,
        ...(authType === 'none'
          ? { secret: null, hasSecret: false }
          : replacesSecret && this.secretColumns(authType, dto.secret)),
      },
    );

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const connection = await this.findOne(id, userId);
    await this.connectionsRepository.remove(connection);
  }

  async findAllForAgent(agentId: string, userId: string) {
    await this.agentsService.findOne(agentId, userId);
    return this.forAgent(agentId);
  }

  async attach(agentId: string, connectionId: string, userId: string) {
    await this.agentsService.findOne(agentId, userId);
    const connection = await this.findOne(connectionId, userId);

    const link =
      (await this.agentConnectionsRepository.findOneBy({
        agentId,
        connectionId,
      })) ??
      (await this.agentConnectionsRepository.save(
        this.agentConnectionsRepository.create({ agentId, connectionId }),
      ));

    return { ...connection, attachedAt: link.createdAt };
  }

  async detach(agentId: string, connectionId: string, userId: string) {
    await this.agentsService.findOne(agentId, userId);

    const link = await this.agentConnectionsRepository.findOneBy({
      agentId,
      connectionId,
    });

    if (!link) {
      throw new NotFoundException(
        `Connection ${connectionId} is not attached to this agent`,
      );
    }

    await this.agentConnectionsRepository.remove(link);
  }

  async forAgent(agentId: string) {
    const links = await this.agentConnectionsRepository.find({
      where: { agentId },
      relations: { connection: true },
      order: { createdAt: 'ASC' },
    });

    return links.map((link) => ({
      ...link.connection,
      attachedAt: link.createdAt,
    }));
  }

  async request(
    agentId: string,
    { connection: name, method, path, body }: ConnectionRequest,
  ): Promise<ConnectionResponse> {
    const connection = await this.connectionsRepository
      .createQueryBuilder('connection')
      .addSelect('connection.secret')
      .innerJoin(
        AgentConnection,
        'link',
        'link.connectionId = connection.id AND link.agentId = :agentId',
        { agentId },
      )
      .where('connection.name = :name', { name })
      .getOne();

    if (!connection) {
      const available = (await this.forAgent(agentId)).map((item) => item.name);
      throw new BadRequestException(
        `Connection "${name}" is not attached to this agent. Available: ${available.length > 0 ? available.join(', ') : 'none'}`,
      );
    }

    if (!connection.allowedMethods.includes(method)) {
      throw new BadRequestException(
        `${method} is not allowed on connection "${name}". Allowed: ${connection.allowedMethods.join(', ')}`,
      );
    }

    let url: URL;

    try {
      url = buildRequestUrl(connection.baseUrl, path);
    } catch (error) {
      if (error instanceof RequestUrlError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const response = await safeFetch(url.href, {
      method,
      headers: {
        accept: 'application/json, text/plain;q=0.9, */*;q=0.5',
        ...(body !== undefined && { 'content-type': 'application/json' }),
        ...this.authHeaders(connection),
      },
      body,
      timeoutMs: REQUEST_TIMEOUT_MS,
      maxBytes: MAX_RESPONSE_BYTES,
    });
    const text = response.body.toString('utf8');

    return {
      connection: name,
      method,
      url: url.href,
      status: response.status,
      contentType: response.headers['content-type'] ?? 'unknown',
      body: text.slice(0, MAX_BODY_CHARACTERS),
      truncated: response.truncated || text.length > MAX_BODY_CHARACTERS,
    };
  }

  private authHeaders(connection: Connection): Record<string, string> {
    if (connection.authType === 'none' || !connection.secret) {
      return {};
    }

    const secret = this.cipher.decrypt(connection.secret);

    return connection.authType === 'bearer'
      ? { authorization: `Bearer ${secret}` }
      : { [connection.authHeaderName ?? 'x-api-key']: secret };
  }

  private secretColumns(authType: AuthType, secret: string | undefined) {
    return authType !== 'none' && secret
      ? { secret: this.cipher.encrypt(secret), hasSecret: true }
      : { secret: null, hasSecret: false };
  }

  private assertAuth(
    authType: AuthType,
    authHeaderName: string | undefined,
    hasSecret: boolean,
  ) {
    if (authType === 'header' && !authHeaderName) {
      throw new BadRequestException(
        'authHeaderName is required for header authentication',
      );
    }

    if (
      authType === 'header' &&
      RESERVED_HEADERS.has(authHeaderName?.toLowerCase() ?? '')
    ) {
      throw new BadRequestException(
        `${authHeaderName} cannot be used as the authentication header`,
      );
    }

    if (authType !== 'none' && !hasSecret) {
      throw new BadRequestException(
        'A secret is required for this authentication type',
      );
    }
  }

  private async assertNameFree(name: string, userId: string) {
    if (await this.connectionsRepository.existsBy({ name, userId })) {
      throw new ConflictException(
        `A connection named "${name}" already exists`,
      );
    }
  }
}
