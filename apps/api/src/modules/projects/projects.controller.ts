import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  Delete,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { KeyType, Environment } from '@flow-kit/database';

@Controller('v1/projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async getProjects(@Req() req: any) {
    return this.projectsService.getProjectsForUser(req.user.id);
  }

  @Get(':id')
  async getProject(@Param('id') id: string) {
    return this.projectsService.getProject(id);
  }

  @Post()
  async createProject(
    @Req() req: any,
    @Body() body: { organizationId?: string; name: string; domains?: string[] },
  ) {
    const orgId = body.organizationId || req.user.memberships[0]?.organizationId;
    return this.projectsService.createProject(orgId, body.name, body.domains || []);
  }

  @Get(':id/keys')
  async getApiKeys(@Param('id') projectId: string) {
    return this.projectsService.getApiKeys(projectId);
  }

  @Post(':id/keys')
  async createApiKey(
    @Param('id') projectId: string,
    @Body() body: { name: string; type?: KeyType; environment?: Environment },
  ) {
    return this.projectsService.createApiKey(
      projectId,
      body.name,
      body.type || KeyType.PUBLIC_CLIENT,
      body.environment || Environment.TEST,
    );
  }

  @Delete(':id/keys/:keyId')
  async revokeApiKey(@Param('keyId') keyId: string) {
    return this.projectsService.revokeApiKey(keyId);
  }

  @Patch(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() body: { name?: string; domains?: string[] },
  ) {
    return this.projectsService.updateProject(id, body);
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string) {
    return this.projectsService.deleteProject(id);
  }
}
