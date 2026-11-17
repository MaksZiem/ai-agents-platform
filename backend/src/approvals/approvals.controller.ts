import {
  Body,
  Controller,
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import {
  BadRequestErrorDto,
  ConflictErrorDto,
  NotFoundErrorDto,
  ServiceUnavailableErrorDto,
  UnauthorizedErrorDto,
} from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import { ApprovalStatus } from './approval-status.js';
import { ApproveDto } from './dto/approve.dto.js';
import { Approval } from './entities/approval.entity.js';
import { ApprovalsService } from './approvals.service.js';

@ApiTags('approvals')
@ApiBearerAuth(BEARER_AUTH)
@ApiUnauthorizedResponse({
  description: 'Brak tokenu lub token nieprawidłowy',
  type: UnauthorizedErrorDto,
})
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista próśb o akceptację',
    description:
      'Zwraca prośby o akceptację operacji i pytania agentów do użytkownika, razem z wykonaniem i agentem.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ApprovalStatus,
    description: 'Filtr po statusie',
  })
  @ApiOkResponse({
    description: 'Lista próśb',
    type: Approval,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowy status',
    type: BadRequestErrorDto,
  })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status', new ParseEnumPipe(ApprovalStatus, { optional: true }))
    status?: ApprovalStatus,
  ) {
    return this.approvalsService.findAll(user.sub, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz prośbę o akceptację' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identyfikator prośby' })
  @ApiOkResponse({ description: 'Prośba o akceptację', type: Approval })
  @ApiNotFoundResponse({
    description: 'Prośba nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.approvalsService.findOne(id, user.sub);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Zaakceptuj operację',
    description:
      'Akceptuje operację i wznawia wykonanie. Jeśli agent zadał pytanie (narzędzie askUser), pole answer jest wymagane.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identyfikator prośby' })
  @ApiOkResponse({ description: 'Prośba po decyzji', type: Approval })
  @ApiBadRequestResponse({
    description: 'Brak odpowiedzi na pytanie agenta',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Prośba nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  @ApiConflictResponse({
    description: 'Prośba została już rozpatrzona',
    type: ConflictErrorDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Nie udało się wznowić wykonania',
    type: ServiceUnavailableErrorDto,
  })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ApproveDto,
  ) {
    return this.approvalsService.decide(
      id,
      user.sub,
      ApprovalStatus.APPROVED,
      dto.answer,
    );
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Odrzuć operację',
    description:
      'Odrzuca operację lub pomija pytanie agenta. Agent sam decyduje, jak kontynuować.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identyfikator prośby' })
  @ApiOkResponse({ description: 'Prośba po decyzji', type: Approval })
  @ApiNotFoundResponse({
    description: 'Prośba nie istnieje lub należy do innego użytkownika',
    type: NotFoundErrorDto,
  })
  @ApiConflictResponse({
    description: 'Prośba została już rozpatrzona',
    type: ConflictErrorDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Nie udało się wznowić wykonania',
    type: ServiceUnavailableErrorDto,
  })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.approvalsService.decide(id, user.sub, ApprovalStatus.REJECTED);
  }
}
