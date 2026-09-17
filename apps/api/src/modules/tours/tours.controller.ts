import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ToursService } from './tours.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('v1/projects/:projectId/tours')
@UseGuards(JwtAuthGuard)
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  async getTours(@Req() req: any, @Param('projectId') projectId: string) {
    await this.toursService.assertProjectAccess(req.user.id, projectId);
    return this.toursService.getTours(projectId);
  }

  @Get(':id')
  async getTour(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Param('id') tourId: string,
  ) {
    await this.toursService.assertTourAccess(req.user.id, tourId, projectId);
    return this.toursService.getTour(tourId);
  }

  @Post()
  async createTour(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Body() body: any,
  ) {
    await this.toursService.assertProjectAccess(req.user.id, projectId);
    return this.toursService.createTour(projectId, body);
  }

  @Put(':id')
  async updateTour(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Param('id') tourId: string,
    @Body() body: any,
  ) {
    await this.toursService.assertTourAccess(req.user.id, tourId, projectId);
    return this.toursService.updateTour(tourId, body);
  }

  @Post(':id/publish')
  async publishTour(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Param('id') tourId: string,
  ) {
    await this.toursService.assertTourAccess(req.user.id, tourId, projectId);
    return this.toursService.publishTour(tourId);
  }

  @Post(':id/archive')
  async archiveTour(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Param('id') tourId: string,
  ) {
    await this.toursService.assertTourAccess(req.user.id, tourId, projectId);
    return this.toursService.archiveTour(tourId);
  }

  @Delete(':id')
  async deleteTour(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Param('id') tourId: string,
  ) {
    await this.toursService.assertTourAccess(req.user.id, tourId, projectId);
    return this.toursService.deleteTour(tourId);
  }
}
