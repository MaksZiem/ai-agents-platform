import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { FilesService } from './files.service.js';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('executionId', new ParseUUIDPipe({ optional: true }))
    executionId?: string,
  ) {
    return this.filesService.findAll(user.sub, executionId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.filesService.findOne(id, user.sub);
  }

  @Get(':id/download')
  async download(
    @Param('id', ParseUUIDPipe) id: string,
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
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.filesService.remove(id, user.sub);
  }
}
