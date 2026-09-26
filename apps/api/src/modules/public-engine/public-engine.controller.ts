import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { PublicEngineService } from './public-engine.service';

@Controller('v1/public')
@UseGuards(ApiKeyGuard)
export class PublicEngineController {
  constructor(private readonly engineService: PublicEngineService) {}

  @Get('tours')
  async getTours(@Req() req: any, @Query('url') urlPath?: string) {
    const projectId = req.project.id;
    const tours = await this.engineService.resolveTours(projectId, urlPath || '/');
    return tours;
  }

  @Get('builder/tours')
  async getBuilderTours(@Req() req: any) {
    const projectId = req.project.id;
    return await this.engineService.getAllTours(projectId);
  }

  @Post('builder/add-step')
  async addBuilderStep(
    @Req() req: any,
    @Body()
    body: {
      tourId: string;
      step: {
        targetSelector: string;
        placement?: string;
        title: string;
        content: string;
        nextBtn?: string;
        backBtn?: string;
      };
    },
  ) {
    const projectId = req.project.id;
    return await this.engineService.addStepFromBuilder(projectId, body.tourId, body.step);
  }

  @Post('events')
  async ingestEvents(@Req() req: any, @Body() body: { events: any[] }) {
    const projectId = req.project.id;
    return await this.engineService.ingestEvents(projectId, body?.events || []);
  }
}
