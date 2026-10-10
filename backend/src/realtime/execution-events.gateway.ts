import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectedSocket,
  MessageBody,
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

@WebSocketGateway({ namespace: 'executions' })
export class ExecutionEventsGateway implements OnGatewayInit {
  @WebSocketServer()
  private readonly server: Namespace;

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
          socket.data.user = user;
          next();
        })
        .catch(() => next(new Error('Unauthorized')));
    });
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
  onExecutionUpdated(event: ExecutionUpdatedEvent) {
    this.server
      .to(executionRoom(event.executionId))
      .emit('execution.updated', event);
  }

  @OnEvent(STEP_UPDATED)
  onStepUpdated(event: StepUpdatedEvent) {
    this.server
      .to(executionRoom(event.executionId))
      .emit('step.updated', event.step);
  }
}
