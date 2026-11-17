import {
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
import { AttachedDocumentDto } from './dto/knowledge-document-response.dto.js';
import { KnowledgeService } from './knowledge.service.js';

@ApiTags('knowledge')
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
@Controller('agents/:agentId/knowledge')
export class AgentKnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  @ApiOperation({ summary: 'Dokumenty przypięte do agenta' })
  @ApiOkResponse({
    description: 'Przypięte dokumenty',
    type: AttachedDocumentDto,
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
    return this.knowledgeService.findAllForAgent(agentId, user.sub);
  }

  @Put(':documentId')
  @ApiOperation({
    summary: 'Przypnij dokument do agenta',
    description:
      'Agent będzie mógł przeszukiwać dokument narzędziem searchDocuments. Operacja idempotentna.',
  })
  @ApiParam({
    name: 'documentId',
    format: 'uuid',
    description: 'Identyfikator dokumentu',
  })
  @ApiOkResponse({
    description: 'Przypięty dokument',
    type: AttachedDocumentDto,
  })
  @ApiNotFoundResponse({
    description: 'Agent lub dokument nie istnieje',
    type: NotFoundErrorDto,
  })
  attach(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.knowledgeService.attach(agentId, documentId, user.sub);
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Odepnij dokument od agenta' })
  @ApiParam({
    name: 'documentId',
    format: 'uuid',
    description: 'Identyfikator dokumentu',
  })
  @ApiNoContentResponse({ description: 'Dokument odpięty' })
  @ApiNotFoundResponse({
    description: 'Agent nie istnieje lub dokument nie jest do niego przypięty',
    type: NotFoundErrorDto,
  })
  detach(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.knowledgeService.detach(agentId, documentId, user.sub);
  }
}
