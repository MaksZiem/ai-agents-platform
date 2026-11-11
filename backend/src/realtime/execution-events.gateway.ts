import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { isUUID } from 'class-validator';
import type { Namespace, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import type { JwtPayload } from '../auth/jwt-payload.js';
import {
  EXECUTION_UPDATED,
  type ExecutionUpdatedEvent,
  STEP_UPDATED,
  type StepUpdatedEvent,
} from '../engine/execution-events.js';
import { Execution } from '../executions/entities/execution.entity.js';

const executionRoom = (executionId: string) => `execution:${executionId}`;
const userRoom = (userId: string) => `user:${userId}`;
const MAX_CACHED_OWNERS = 500;

@WebSocketGateway({ namespace: 'executions' })
export class ExecutionEventsGateway
  implements OnGatewayInit, OnGatewayConnection
{
  @WebSocketServer()
  private readonly server: Namespace;

  private readonly owners = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Execution)
    private readonly executionsRepository: Repository<Execution>,
  ) {}

  afterInit(server: Namespace) {
    server.use((socket, next) => {
      const token: unknown = socket.handshake.auth.token;

      if (typeof token !== 'string') {
        return next(new Error('Unauthorized'));
      }

      this.jwtService
        .verifyAsync<JwtPayload>(token)
        .then((user) => {
          if (user.type !== 'socket') {
            next(new Error('Unauthorized'));
            return;
          }
          socket.data.user = user;
          next();
        })
        .catch(() => next(new Error('Unauthorized')));
    });
  }

  async handleConnection(client: Socket) {
    const user = client.data.user as JwtPayload | undefined;

    if (user) {
      await client.join(userRoom(user.sub));
    }
  }

  @SubscribeMessage('subscribe')
  async subscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() executionId: unknown,
  ) {
    const user = client.data.user as JwtPayload;

    if (typeof executionId !== 'string' || !isUUID(executionId)) {
      return { ok: false };
    }

    const isOwner = await this.executionsRepository.existsBy({
      id: executionId,
      userId: user.sub,
    });

    if (!isOwner) {
      return { ok: false };
    }

    await client.join(executionRoom(executionId));
    return { ok: true };
  }

  @SubscribeMessage('unsubscribe')
  async unsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() executionId: unknown,
  ) {
    if (typeof executionId === 'string') {
      await client.leave(executionRoom(executionId));
    }

    return { ok: true };
  }

  @OnEvent(EXECUTION_UPDATED)
  async onExecutionUpdated(event: ExecutionUpdatedEvent) {
    this.server
      .to(executionRoom(event.executionId))
      .emit('execution.updated', event);
    await this.notifyOwner(event.executionId);
  }

  @OnEvent(STEP_UPDATED)
  async onStepUpdated(event: StepUpdatedEvent) {
    this.server
      .to(executionRoom(event.executionId))
      .emit('step.updated', event.step);
    await this.notifyOwner(event.executionId);
  }

  private async notifyOwner(executionId: string) {
    const userId = await this.ownerOf(executionId);

    if (userId) {
      this.server.to(userRoom(userId)).emit('activity', { executionId });
    }
  }

  private async ownerOf(executionId: string): Promise<string | null> {
    const cached = this.owners.get(executionId);

    if (cached) {
      return cached;
    }

    const execution = await this.executionsRepository.findOne({
      where: { id: executionId },
      select: { id: true, userId: true },
    });

    if (!execution) {
      return null;
    }

    if (this.owners.size >= MAX_CACHED_OWNERS) {
      this.owners.clear();
    }
    this.owners.set(executionId, execution.userId);
    return execution.userId;
  }
}
