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
  async getProject(@Req() req: any, @Param('id') id: string) {
    await this.projectsService.assertProjectAccess(req.user.id, id);
    return this.projectsService.getProject(id);
  }

  @Post()
  async createProject(
    @Req() req: any,
    @Body() body: { organizationId?: string; name: string; domains?: string[] },
  ) {
    const orgId = body.organizationId || req.user.memberships?.[0]?.organizationId;
    if (!orgId) {
      throw new Error('Organization ID is required');
    }
    await this.projectsService.assertOrgAccess(req.user.id, orgId);
    return this.projectsService.createProject(orgId, body.name, body.domains || []);
  }

  @Get(':id/keys')
  async getApiKeys(@Req() req: any, @Param('id') projectId: string) {
    await this.projectsService.assertProjectAccess(req.user.id, projectId);
    return this.projectsService.getApiKeys(projectId);
  }

  @Post(':id/keys')
  async createApiKey(
    @Req() req: any,
    @Param('id') projectId: string,
    @Body() body: { name: string; type?: KeyType; environment?: Environment },
  ) {
    await this.projectsService.assertProjectAccess(req.user.id, projectId);
    return this.projectsService.createApiKey(
      projectId,
      body.name,
      body.type || KeyType.PUBLIC_CLIENT,
      body.environment || Environment.TEST,
    );
  }

  @Delete(':id/keys/:keyId')
  async revokeApiKey(
    @Req() req: any,
    @Param('id') projectId: string,
    @Param('keyId') keyId: string,
  ) {
    await this.projectsService.assertProjectAccess(req.user.id, projectId);
    return this.projectsService.revokeApiKey(projectId, keyId);
  }

  @Patch(':id')
  async updateProject(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { name?: string; domains?: string[] },
  ) {
    await this.projectsService.assertProjectAccess(req.user.id, id);
    return this.projectsService.updateProject(id, body);
  }

  @Delete(':id')
  async deleteProject(@Req() req: any, @Param('id') id: string) {
    await this.projectsService.assertProjectAccess(req.user.id, id);
    return this.projectsService.deleteProject(id);
  }
}
