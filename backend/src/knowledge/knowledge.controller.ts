import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiPayloadTooLargeResponse,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import {
  BadRequestErrorDto,
  NotFoundErrorDto,
  PayloadTooLargeErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import {
  KnowledgeDocumentDetailDto,
  KnowledgeDocumentListItemDto,
} from './dto/knowledge-document-response.dto.js';
import { KnowledgeDocument } from './entities/knowledge-document.entity.js';
import {
  KnowledgeService,
  type UploadedDocumentFile,
} from './knowledge.service.js';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

@ApiTags('knowledge')
@ApiBearerAuth(BEARER_AUTH)
@ApiUnauthorizedResponse({
  description: 'Brak tokenu lub token nieprawidłowy',
  type: UnauthorizedErrorDto,
})
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  // multipart/form-data with the document in the "file" field.
  @Post()
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }),
  )
  @ApiOperation({
    summary: 'Wgraj dokument',
    description:
      'Przyjmuje plik TXT, MD, CSV, JSON lub PDF (maks. 5 MB), wyciąga z niego tekst i dzieli go na fragmenty do wyszukiwania.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiCreatedResponse({
    description: 'Zapisany dokument',
    type: KnowledgeDocument,
  })
  @ApiBadRequestResponse({
    description:
      'Brak pliku, nieobsługiwany typ (FILE_TYPE_UNSUPPORTED), nieczytelny PDF (PDF_UNREADABLE) lub brak tekstu (FILE_NO_TEXT)',
    type: BadRequestErrorDto,
  })
  @ApiPayloadTooLargeResponse({
    description: 'Plik większy niż 5 MB',
    type: PayloadTooLargeErrorDto,
  })
  upload(
    @UploadedFile() file: UploadedDocumentFile | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException('Send the document in the "file" field');
    }

    return this.knowledgeService.upload(user.sub, file);
  }

  @Get()
  @ApiOperation({ summary: 'Lista dokumentów bazy wiedzy' })
  @ApiOkResponse({
    description: 'Dokumenty wraz z agentami, którzy z nich korzystają',
    type: KnowledgeDocumentListItemDto,
    isArray: true,
  })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.knowledgeService.findAll(user.sub);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Pobierz oryginalny plik dokumentu' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator dokumentu',
  })
  @ApiProduces('application/octet-stream')
  @ApiOkResponse({
    description: 'Plik jako załącznik',
    schema: { type: 'string', format: 'binary' },
  })
  @ApiNotFoundResponse({
    description: 'Dokument nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const { name, mimeType, content } = await this.knowledgeService.download(
      id,
      user.sub,
    );

    return new StreamableFile(content, {
      type: mimeType,
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Szczegóły dokumentu' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator dokumentu',
  })
  @ApiOkResponse({
    description: 'Dokument z fragmentami tekstu i agentami',
    type: KnowledgeDocumentDetailDto,
  })
  @ApiNotFoundResponse({
    description: 'Dokument nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.knowledgeService.findOne(id, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Usuń dokument',
    description: 'Dokument zostaje też odpięty od wszystkich agentów.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Identyfikator dokumentu',
  })
  @ApiNoContentResponse({ description: 'Dokument usunięty' })
  @ApiNotFoundResponse({
    description: 'Dokument nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.knowledgeService.remove(id, user.sub);
  }
}
