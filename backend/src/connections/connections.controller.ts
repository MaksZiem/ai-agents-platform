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
  ApiConflictResponse,
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
  ConflictErrorDto,
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import { ConnectionsService } from './connections.service.js';
import { CreateConnectionDto } from './dto/create-connection.dto.js';
import { UpdateConnectionDto } from './dto/update-connection.dto.js';
import { Connection } from './entities/connection.entity.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';

@ApiTags('connections')
@ApiBearerAuth(BEARER_AUTH)
@ApiUnauthorizedResponse({
  description: 'Brak tokenu lub token nieprawidłowy',
  type: UnauthorizedErrorDto,
})
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista połączeń użytkownika',
    description:
      'Sekret połączenia nigdy nie jest zwracany; pole hasSecret mówi, czy jest ustawiony.',
  })
  @ApiOkResponse({
    description: 'Lista połączeń',
    type: Connection,
    isArray: true,
  })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.connectionsService.findAll(user.sub);
  }

  @Post()
  @ApiOperation({
    summary: 'Utwórz połączenie',
    description:
      'Zapisuje adres zewnętrznego API, sposób uwierzytelnienia i dozwolone metody HTTP. Sekret jest przechowywany na serwerze i nie trafia do modelu.',
  })
  @ApiCreatedResponse({ description: 'Utworzone połączenie', type: Connection })
  @ApiBadRequestResponse({
    description:
      'Nieprawidłowe dane lub zarezerwowana nazwa nagłówka (kod CONNECTION_HEADER_RESERVED)',
    type: BadRequestErrorDto,
  })
  @ApiConflictResponse({
    description: 'Nazwa połączenia jest zajęta (kod CONNECTION_NAME_TAKEN)',
    type: ConflictErrorDto,
  })
  create(@Body() dto: CreateConnectionDto, @CurrentUser() user: JwtPayload) {
    return this.connectionsService.create(dto, user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz połączenie' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator połączenia',
  })
  @ApiOkResponse({ description: 'Połączenie', type: Connection })
  @ApiNotFoundResponse({
    description: 'Połączenie nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  findOne(
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.connectionsService.findOne(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Zaktualizuj połączenie',
    description: 'Pola pominięte w body pozostają bez zmian.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator połączenia',
  })
  @ApiOkResponse({ description: 'Zaktualizowane połączenie', type: Connection })
  @ApiBadRequestResponse({
    description:
      'Nieprawidłowe dane lub zarezerwowana nazwa nagłówka (kod CONNECTION_HEADER_RESERVED)',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Połączenie nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  @ApiConflictResponse({
    description: 'Nazwa połączenia jest zajęta (kod CONNECTION_NAME_TAKEN)',
    type: ConflictErrorDto,
  })
  update(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: UpdateConnectionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.connectionsService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Usuń połączenie',
    description: 'Połączenie zostaje też odpięte od wszystkich agentów.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator połączenia',
  })
  @ApiNoContentResponse({ description: 'Połączenie usunięte' })
  @ApiNotFoundResponse({
    description: 'Połączenie nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  remove(
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.connectionsService.remove(id, user.sub);
  }
}
