import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import {
  BadRequestErrorDto,
  ConflictErrorDto,
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import {
  AgentActivityDto,
  ExecutionDetailDto,
} from './dto/execution-response.dto.js';
import { Execution } from './entities/execution.entity.js';
import { ExecutionStatus } from './execution-status.js';
import { ExecutionsService } from './executions.service.js';

@ApiTags('executions')
@ApiBearerAuth(BEARER_AUTH)
@ApiUnauthorizedResponse({
  description: 'Brak tokenu lub token nieprawidłowy',
  type: UnauthorizedErrorDto,
})
@Controller('executions')
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista wykonań użytkownika' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ExecutionStatus,
    description: 'Filtr po statusie',
  })
  @ApiOkResponse({
    description: 'Wykonania wraz z agentem, od najnowszych',
    type: Execution,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowy status',
    type: BadRequestErrorDto,
  })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status', new ParseEnumPipe(ExecutionStatus, { optional: true }))
    status?: ExecutionStatus,
  ) {
    return this.executionsService.findAll(user.sub, { status });
  }

  @Get('activity')
  @ApiOperation({
    summary: 'Aktywność agentów',
    description:
      'Dla każdego agenta: liczba uruchomień, ostatnie uruchomienie i bieżący krok trwającego wykonania.',
  })
  @ApiOkResponse({
    description: 'Aktywność pogrupowana po agencie',
    type: AgentActivityDto,
    isArray: true,
  })
  activity(@CurrentUser() user: JwtPayload) {
    return this.executionsService.activity(user.sub);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Szczegóły wykonania',
    description:
      'Zwraca wykonanie z agentem, krokami w kolejności i metrykami.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator wykonania',
  })
  @ApiOkResponse({ description: 'Wykonanie', type: ExecutionDetailDto })
  @ApiNotFoundResponse({
    description: 'Wykonanie nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.executionsService.findOne(id, user.sub);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Anuluj wykonanie',
    description:
      'Zmienia status na CANCELLED, pomija niedokończone kroki i anuluje oczekujące akceptacje.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator wykonania',
  })
  @ApiOkResponse({
    description: 'Anulowane wykonanie',
    type: ExecutionDetailDto,
  })
  @ApiNotFoundResponse({
    description: 'Wykonanie nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  @ApiConflictResponse({
    description:
      'Wykonanie jest już zakończone lub jego status zmienił inny proces',
    type: ConflictErrorDto,
  })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.executionsService.cancel(id, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Usuń wykonanie',
    description: 'Można usunąć tylko zakończone wykonanie.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator wykonania',
  })
  @ApiNoContentResponse({ description: 'Wykonanie usunięte' })
  @ApiNotFoundResponse({
    description: 'Wykonanie nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  @ApiConflictResponse({
    description: 'Wykonanie jeszcze trwa',
    type: ConflictErrorDto,
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.executionsService.remove(id, user.sub);
  }
}
