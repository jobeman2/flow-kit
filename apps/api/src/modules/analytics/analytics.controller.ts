import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('v1/projects/:projectId/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(@Param('projectId') projectId: string) {
    return this.analyticsService.getProjectAnalyticsOverview(projectId);
  }

  @Get('funnel')
  async getFunnel(
    @Param('projectId') projectId: string,
    @Query('tourId') tourId?: string,
  ) {
    return this.analyticsService.getTourFunnel(projectId, tourId);
  }
}
