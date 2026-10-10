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
import { ExecutionStatus } from './execution-status.js';
import { ExecutionsService } from './executions.service.js';

@Controller('executions')
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status', new ParseEnumPipe(ExecutionStatus, { optional: true }))
    status?: ExecutionStatus,
  ) {
    return this.executionsService.findAll(user.sub, { status });
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.executionsService.findOne(id, user.sub);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.executionsService.cancel(id, user.sub);
  }
}
