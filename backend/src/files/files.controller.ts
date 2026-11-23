import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
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
import { GeneratedFile } from './entities/generated-file.entity.js';
import { FilesService } from './files.service.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';

@ApiTags('files')
@ApiBearerAuth(BEARER_AUTH)
@ApiUnauthorizedResponse({
  description: 'Brak tokenu lub token nieprawidłowy',
  type: UnauthorizedErrorDto,
})
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista wygenerowanych plików',
    description: 'Pliki utworzone przez agentów, np. raporty.',
  })
  @ApiQuery({
    name: 'executionId',
    required: false,
    type: String,
    format: 'uuid',
    description: 'Tylko pliki z danego wykonania',
  })
  @ApiOkResponse({
    description: 'Lista plików (bez treści)',
    type: GeneratedFile,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'executionId nie jest poprawnym UUID',
    type: BadRequestErrorDto,
  })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('executionId', new ParseIdPipe({ optional: true }))
    executionId?: string,
  ) {
    return this.filesService.findAll(user.sub, executionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Metadane pliku' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identyfikator pliku' })
  @ApiOkResponse({ description: 'Plik (bez treści)', type: GeneratedFile })
  @ApiNotFoundResponse({
    description: 'Plik nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  findOne(
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.filesService.findOne(id, user.sub);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Pobierz plik' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identyfikator pliku' })
  @ApiProduces('application/octet-stream')
  @ApiOkResponse({
    description: 'Treść pliku jako załącznik',
    schema: { type: 'string', format: 'binary' },
  })
  @ApiNotFoundResponse({
    description: 'Plik nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  async download(
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.filesService.findWithContent(id, {
      userId: user.sub,
    });

    if (!result) {
      throw new NotFoundException('File not found');
    }

    const { file, content } = result;

    return new StreamableFile(Buffer.from(content, 'utf8'), {
      type: `${file.mimeType}; charset=utf-8`,
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Usuń plik' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identyfikator pliku' })
  @ApiNoContentResponse({ description: 'Plik usunięty' })
  @ApiNotFoundResponse({
    description: 'Plik nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  remove(
    @Param('id', ParseIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.filesService.remove(id, user.sub);
  }
}
