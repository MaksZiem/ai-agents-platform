import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { AgentPermissionsService } from './agent-permissions.service.js';
import { ResourcePermissionsDto } from './dto/agent-permissions-response.dto.js';
import { UpdateAgentPermissionsDto } from './dto/update-agent-permissions.dto.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';

@ApiTags('agents')
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
@Controller('agents/:agentId/permissions')
export class AgentPermissionsController {
  constructor(
    private readonly agentPermissionsService: AgentPermissionsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Uprawnienia agenta',
    description:
      'Zwraca wszystkie obsługiwane zasoby i akcje wraz z informacją, czy agent ma dane uprawnienie. Backend sprawdza uprawnienia przy każdym wywołaniu narzędzia.',
  })
  @ApiOkResponse({
    description: 'Uprawnienia pogrupowane po zasobie',
    type: ResourcePermissionsDto,
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
    return this.agentPermissionsService.findAll(agentId, user.sub);
  }

  @Put()
  @ApiOperation({
    summary: 'Zastąp uprawnienia agenta',
    description:
      'Ustawia pełną listę uprawnień. Uprawnienia spoza listy zostają odebrane.',
  })
  @ApiOkResponse({
    description: 'Uprawnienia po zmianie',
    type: ResourcePermissionsDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Nieobsługiwana para zasób/akcja lub nieprawidłowe dane',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Agent nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  replace(
    @Param('agentId', ParseIdPipe) agentId: string,
    @Body() dto: UpdateAgentPermissionsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agentPermissionsService.replace(
      agentId,
      dto.permissions,
      user.sub,
    );
  }
}
