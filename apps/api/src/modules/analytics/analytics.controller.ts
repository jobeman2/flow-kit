import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('v1/projects/:projectId/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(@Req() req: any, @Param('projectId') projectId: string) {
    await this.analyticsService.assertProjectAccess(req.user.id, projectId);
    return this.analyticsService.getProjectAnalyticsOverview(projectId);
  }

  @Get('funnel')
  async getFunnel(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Query('tourId') tourId?: string,
  ) {
    await this.analyticsService.assertProjectAccess(req.user.id, projectId);
    return this.analyticsService.getTourFunnel(projectId, tourId);
  }
}
