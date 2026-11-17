import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { UnauthorizedErrorDto } from '../common/swagger/error-response.dto.js';
import { BEARER_AUTH } from '../common/swagger/swagger.setup.js';
import { DashboardService } from './dashboard.service.js';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto.js';

@ApiTags('dashboard')
@ApiBearerAuth(BEARER_AUTH)
@ApiUnauthorizedResponse({
  description: 'Brak tokenu lub token nieprawidłowy',
  type: UnauthorizedErrorDto,
})
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Podsumowanie dashboardu',
    description:
      'Liczniki agentów i zadań, ostatnie wykonania, aktywność z 14 dni, zużycie z 7 dni, najczęściej używane narzędzia, limity oraz rzeczy wymagające uwagi.',
  })
  @ApiOkResponse({ description: 'Podsumowanie', type: DashboardSummaryDto })
  getSummary(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getSummary(user.sub);
  }
}
