import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import {
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import { ConnectionsService } from './connections.service.js';
import { AttachedConnectionDto } from './dto/attached-connection.dto.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';

@ApiTags('connections')
@ApiBearerAuth(BEARER_AUTH)
@ApiUnauthorizedResponse({
  description: 'Brak tokenu lub token nieprawidłowy',
  type: UnauthorizedErrorDto,
})
@ApiParam({
  name: 'agentId',
  format: 'uuid',
  description: 'Identyfikator agenta',
})
@Controller('agents/:agentId/connections')
export class AgentConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Połączenia przypięte do agenta' })
  @ApiOkResponse({
    description: 'Przypięte połączenia',
    type: AttachedConnectionDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Agent nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  findAll(
    @Param('agentId', ParseIdPipe) agentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.connectionsService.findAllForAgent(agentId, user.sub);
  }

  @Put(':connectionId')
  @ApiOperation({
    summary: 'Przypnij połączenie do agenta',
    description: 'Operacja idempotentna.',
  })
  @ApiParam({
    name: 'connectionId',
    format: 'uuid',
    description: 'Identyfikator połączenia',
  })
  @ApiOkResponse({
    description: 'Przypięte połączenie',
    type: AttachedConnectionDto,
  })
  @ApiNotFoundResponse({
    description: 'Agent lub połączenie nie istnieje',
    type: NotFoundErrorDto,
  })
  attach(
    @Param('agentId', ParseIdPipe) agentId: string,
    @Param('connectionId', ParseIdPipe) connectionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.connectionsService.attach(agentId, connectionId, user.sub);
  }

  @Delete(':connectionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Odepnij połączenie od agenta' })
  @ApiParam({
    name: 'connectionId',
    format: 'uuid',
    description: 'Identyfikator połączenia',
  })
  @ApiNoContentResponse({ description: 'Połączenie odpięte' })
  @ApiNotFoundResponse({
    description:
      'Agent nie istnieje lub połączenie nie jest do niego przypięte',
    type: NotFoundErrorDto,
  })
  detach(
    @Param('agentId', ParseIdPipe) agentId: string,
    @Param('connectionId', ParseIdPipe) connectionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.connectionsService.detach(agentId, connectionId, user.sub);
  }
}
