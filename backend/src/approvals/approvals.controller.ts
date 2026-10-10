import {
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
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { ApprovalStatus } from './approval-status.js';
import { ApprovalsService } from './approvals.service.js';

@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status', new ParseEnumPipe(ApprovalStatus, { optional: true }))
    status?: ApprovalStatus,
  ) {
    return this.approvalsService.findAll(user.sub, status);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.approvalsService.findOne(id, user.sub);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.approvalsService.decide(id, user.sub, ApprovalStatus.APPROVED);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.approvalsService.decide(id, user.sub, ApprovalStatus.REJECTED);
  }
}
