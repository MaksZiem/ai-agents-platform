import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import {
  BadRequestErrorDto,
  ConflictErrorDto,
  NotFoundErrorDto,
  ServiceUnavailableErrorDto,
  TooManyRequestsErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import { CreateExecutionDto } from './dto/create-execution.dto.js';
import { Execution } from './entities/execution.entity.js';
import { ExecutionsService } from './executions.service.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';

@ApiTags('executions')
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
@Controller('agents/:agentId/executions')
export class AgentExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Uruchom zadanie',
    description:
      'Tworzy wykonanie w statusie QUEUED i przekazuje je do kolejki. Agent sam planuje kroki; postęp jest wysyłany przez WebSocket.',
  })
  @ApiCreatedResponse({ description: 'Utworzone wykonanie', type: Execution })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe dane wejściowe',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Agent nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  @ApiConflictResponse({
    description: 'Agent jest nieaktywny',
    type: ConflictErrorDto,
  })
  @ApiTooManyRequestsResponse({
    description:
      'Przekroczony limit startów na minutę, równoległych wykonań lub dziennych tokenów (kody RATE_LIMIT_STARTS, RATE_LIMIT_CONCURRENT, DAILY_TOKEN_LIMIT)',
    type: TooManyRequestsErrorDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Nie udało się dodać wykonania do kolejki',
    type: ServiceUnavailableErrorDto,
  })
  create(
    @Param('agentId', ParseIdPipe) agentId: string,
    @Body() dto: CreateExecutionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.executionsService.create(agentId, dto.task, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Historia wykonań agenta' })
  @ApiOkResponse({
    description: 'Wykonania agenta, od najnowszych',
    type: Execution,
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
    return this.executionsService.findAllForAgent(agentId, user.sub);
  }
}
