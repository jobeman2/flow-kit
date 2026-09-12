import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ToursService } from './tours.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('v1/projects/:projectId/tours')
@UseGuards(JwtAuthGuard)
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  async getTours(@Param('projectId') projectId: string) {
    return this.toursService.getTours(projectId);
  }

  @Get(':id')
  async getTour(@Param('id') tourId: string) {
    return this.toursService.getTour(tourId);
  }

  @Post()
  async createTour(
    @Param('projectId') projectId: string,
    @Body() body: any,
  ) {
    return this.toursService.createTour(projectId, body);
  }

  @Put(':id')
  async updateTour(
    @Param('id') tourId: string,
    @Body() body: any,
  ) {
    return this.toursService.updateTour(tourId, body);
  }

  @Post(':id/publish')
  async publishTour(@Param('id') tourId: string) {
    return this.toursService.publishTour(tourId);
  }

  @Post(':id/archive')
  async archiveTour(@Param('id') tourId: string) {
    return this.toursService.archiveTour(tourId);
  }

  @Delete(':id')
  async deleteTour(@Param('id') tourId: string) {
    return this.toursService.deleteTour(tourId);
  }
}
