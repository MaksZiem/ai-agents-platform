import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import { ToolResponseDto } from './dto/tool-response.dto.js';
import { ToolsService } from './tools.service.js';

@ApiTags('tools')
@ApiBearerAuth(BEARER_AUTH)
@ApiUnauthorizedResponse({
  description: 'Brak tokenu lub token nieprawidłowy',
  type: UnauthorizedErrorDto,
})
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get()
  @ApiOperation({
    summary: 'Katalog narzędzi',
    description:
      'Wszystkie narzędzia, które można włączyć agentom, ze schematami wejścia i wyjścia oraz wymaganymi uprawnieniami.',
  })
  @ApiOkResponse({
    description: 'Lista narzędzi',
    type: ToolResponseDto,
    isArray: true,
  })
  findAll() {
    return this.toolsService.findAll();
  }

  @Get(':name')
  @ApiOperation({ summary: 'Szczegóły narzędzia' })
  @ApiParam({
    name: 'name',
    description: 'Nazwa narzędzia',
    example: 'getTransactions',
  })
  @ApiOkResponse({ description: 'Narzędzie', type: ToolResponseDto })
  @ApiNotFoundResponse({
    description: 'Narzędzie nie istnieje',
    type: NotFoundErrorDto,
  })
  findOne(@Param('name') name: string) {
    return this.toolsService.findOne(name);
  }
}
