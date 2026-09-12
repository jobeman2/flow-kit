import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { KeyType, Environment, KeyStatus } from '@onboardflow/database';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjectsForUser(userId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            organization: {
              include: {
                projects: {
                  include: {
                    apiKeys: true,
                    _count: {
                      select: { tours: true, events: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const projects: any[] = [];
    for (const membership of user.memberships) {
      for (const p of membership.organization.projects) {
        projects.push({
          ...p,
          organizationName: membership.organization.name,
          organizationRole: membership.role,
        });
      }
    }
    return projects;
  }

  async getProject(projectId: string) {
    const project = await this.prisma.client.project.findUnique({
      where: { id: projectId },
      include: {
        organization: true,
        apiKeys: true,
        tours: {
          include: { steps: { orderBy: { stepIndex: 'asc' } } },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async createProject(organizationId: string, name: string, domains: string[] = []) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const project = await this.prisma.client.project.create({
      data: {
        organizationId,
        name,
        slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
        domains,
      },
    });

    // Create default test & live keys
    const testKey = 'pk_test_' + Math.random().toString(36).substring(2, 14) + Date.now().toString(36);
    const liveKey = 'pk_live_' + Math.random().toString(36).substring(2, 14) + Date.now().toString(36);

    await this.prisma.client.apiKey.createMany({
      data: [
        {
          projectId: project.id,
          name: 'Development Client Key',
          key: testKey,
          type: KeyType.PUBLIC_CLIENT,
          environment: Environment.TEST,
        },
        {
          projectId: project.id,
          name: 'Production Client Key',
          key: liveKey,
          type: KeyType.PUBLIC_CLIENT,
          environment: Environment.PRODUCTION,
        },
      ],
    });

    return this.getProject(project.id);
  }

  async getApiKeys(projectId: string) {
    return this.prisma.client.apiKey.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createApiKey(
    projectId: string,
    name: string,
    type: KeyType = KeyType.PUBLIC_CLIENT,
    environment: Environment = Environment.TEST,
  ) {
    const prefix = type === KeyType.PUBLIC_CLIENT ? (environment === Environment.PRODUCTION ? 'pk_live_' : 'pk_test_') : (environment === Environment.PRODUCTION ? 'sk_live_' : 'sk_test_');
    const random = Math.random().toString(36).substring(2, 14) + Date.now().toString(36);
    const key = `${prefix}${random}`;

    return this.prisma.client.apiKey.create({
      data: {
        projectId,
        name,
        key,
        type,
        environment,
        status: KeyStatus.ACTIVE,
      },
    });
  }

  async revokeApiKey(keyId: string) {
    return this.prisma.client.apiKey.update({
      where: { id: keyId },
      data: {
        status: KeyStatus.REVOKED,
        revokedAt: new Date(),
      },
    });
  }
}
