import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { AgentToolsService } from './agent-tools.service.js';
import { AgentToolResponseDto } from './dto/agent-tool-response.dto.js';
import { EnableAgentToolDto } from './dto/enable-agent-tool.dto.js';

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
@Controller('agents/:agentId/tools')
export class AgentToolsController {
  constructor(private readonly agentToolsService: AgentToolsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista narzędzi włączonych dla agenta' })
  @ApiOkResponse({
    description: 'Włączone narzędzia',
    type: AgentToolResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Agent nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  findAll(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agentToolsService.findAll(agentId, user.sub);
  }

  @Put(':toolName')
  @ApiOperation({
    summary: 'Włącz narzędzie dla agenta',
    description:
      'Włącza narzędzie z katalogu lub zmienia jego ustawienia. Operacja idempotentna. Narzędzia, które z definicji wymagają akceptacji, wymagają jej zawsze.',
  })
  @ApiParam({
    name: 'toolName',
    description: 'Nazwa narzędzia z katalogu',
    example: 'sendEmail',
  })
  @ApiOkResponse({
    description: 'Włączone narzędzie',
    type: AgentToolResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Agent lub narzędzie nie istnieje',
    type: NotFoundErrorDto,
  })
  enable(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('toolName') toolName: string,
    @Body() dto: EnableAgentToolDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agentToolsService.enable(agentId, toolName, dto, user.sub);
  }

  @Delete(':toolName')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Wyłącz narzędzie dla agenta' })
  @ApiParam({
    name: 'toolName',
    description: 'Nazwa narzędzia z katalogu',
    example: 'sendEmail',
  })
  @ApiNoContentResponse({ description: 'Narzędzie wyłączone' })
  @ApiNotFoundResponse({
    description: 'Agent nie istnieje lub narzędzie nie jest dla niego włączone',
    type: NotFoundErrorDto,
  })
  disable(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('toolName') toolName: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agentToolsService.disable(agentId, toolName, user.sub);
  }
}
