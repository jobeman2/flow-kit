import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
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

  @Post('builder/create-tour')
  async createBuilderTour(
    @Req() req: any,
    @Body()
    body: {
      title: string;
      targetUrlPattern: string;
      description?: string;
    },
  ) {
    const projectId = req.project.id;
    return await this.engineService.createTourFromBuilder(projectId, body);
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

  @Post('builder/add-steps')
  async addBuilderSteps(
    @Req() req: any,
    @Body()
    body: {
      tourId: string;
      steps: Array<{
        targetSelector: string;
        placement?: string;
        title: string;
        content: string;
        nextBtn?: string;
        backBtn?: string;
      }>;
    },
  ) {
    const projectId = req.project.id;
    return await this.engineService.addStepsFromBuilder(projectId, body.tourId, body.steps);
  }

  @Delete('builder/steps/:stepId')
  async deleteBuilderStep(@Req() req: any, @Param('stepId') stepId: string) {
    const projectId = req.project.id;
    return await this.engineService.deleteStepFromBuilder(projectId, stepId);
  }

  @Post('events')
  async ingestEvents(@Req() req: any, @Body() body: { events: any[] }) {
    const projectId = req.project.id;
    return await this.engineService.ingestEvents(projectId, body?.events || []);
  }
}
