import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
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
  BadRequestErrorDto,
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import { AgentsService } from './agents.service.js';
import { CreateAgentDto } from './dto/create-agent.dto.js';
import { UpdateAgentDto } from './dto/update-agent.dto.js';
import { Agent } from './entities/agent.entity.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';

@ApiTags('agents')
@ApiBearerAuth(BEARER_AUTH)
@ApiUnauthorizedResponse({
  description: 'Brak tokenu lub token nieprawidłowy',
  type: UnauthorizedErrorDto,
})
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Utwórz agenta',
    description:
      'Tworzy agenta z instrukcjami i ustawieniami modelu. Narzędzia, uprawnienia, wiedzę i połączenia przypina się osobnymi endpointami.',
  })
  @ApiCreatedResponse({ description: 'Utworzony agent', type: Agent })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe dane wejściowe',
    type: BadRequestErrorDto,
  })
  create(@Body() dto: CreateAgentDto, @CurrentUser() user: JwtPayload) {
    return this.agentsService.create(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lista agentów użytkownika' })
  @ApiOkResponse({ description: 'Lista agentów', type: Agent, isArray: true })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.agentsService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz agenta' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identyfikator agenta' })
  @ApiOkResponse({ description: 'Agent', type: Agent })
  @ApiNotFoundResponse({
    description: 'Agent nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  findOne(
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agentsService.findOne(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Zaktualizuj agenta',
    description:
      'Pola pominięte w body pozostają bez zmian. Zmiana statusu na INACTIVE blokuje uruchamianie nowych zadań.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identyfikator agenta' })
  @ApiOkResponse({ description: 'Zaktualizowany agent', type: Agent })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowe dane wejściowe',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Agent nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  update(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: UpdateAgentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agentsService.update(id, dto, user.sub);
  }

  @Post(':id/duplicate')
  @ApiOperation({
    summary: 'Zduplikuj agenta',
    description:
      'Tworzy kopię agenta razem z narzędziami, uprawnieniami, dokumentami i połączeniami.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator agenta do skopiowania',
  })
  @ApiCreatedResponse({ description: 'Nowy agent (kopia)', type: Agent })
  @ApiNotFoundResponse({
    description: 'Agent nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  duplicate(
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agentsService.duplicate(id, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Usuń agenta',
    description: 'Usuwa agenta wraz z jego wykonaniami i konfiguracją.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identyfikator agenta' })
  @ApiNoContentResponse({ description: 'Agent usunięty' })
  @ApiNotFoundResponse({
    description: 'Agent nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  remove(
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agentsService.remove(id, user.sub);
  }
}
