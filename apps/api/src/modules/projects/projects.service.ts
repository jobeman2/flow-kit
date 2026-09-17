import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import {
  KeyType,
  Environment,
  KeyStatus,
  OrgRole,
  TourStatus,
  TriggerType,
  StepPlacement,
  StepAction,
} from '@flow-kit/database';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async assertProjectAccess(userId: string, projectId: string) {
    const project = await this.prisma.client.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: {
            some: { userId },
          },
        },
      },
    });
    if (!project) {
      throw new ForbiddenException('Access denied: You do not have permission to access this project.');
    }
    return project;
  }

  async assertOrgAccess(userId: string, organizationId: string) {
    const member = await this.prisma.client.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
      },
    });
    if (!member) {
      throw new ForbiddenException('Access denied: You are not a member of this organization.');
    }
    return member;
  }

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

    // Auto-provision initial workspace & project if user has none
    if (projects.length === 0) {
      const workspaceName = user.name ? `${user.name}'s Workspace` : 'My Workspace';
      const orgSlug = `org-${Math.random().toString(36).substring(2, 8)}`;

      const org = await this.prisma.client.organization.create({
        data: {
          name: workspaceName,
          slug: orgSlug,
          members: {
            create: {
              userId: user.id,
              role: OrgRole.OWNER,
            },
          },
        },
      });

      const newProject = await this.createProject(org.id, 'Main Application');

      // Seed starter multilingual walkthrough tour
      await this.prisma.client.tour.create({
        data: {
          projectId: newProject.id,
          title: 'Welcome Walkthrough',
          slug: 'welcome-walkthrough',
          status: TourStatus.PUBLISHED,
          triggerType: TriggerType.AUTO_FIRST_VISIT,
          targetUrlPattern: '*',
          defaultLocale: 'en',
          steps: {
            create: [
              {
                stepIndex: 0,
                targetSelector: '#global-search-bar',
                placement: StepPlacement.BOTTOM,
                requiredAction: StepAction.NONE,
                i18n: {
                  en: {
                    title: 'Instant Global Search',
                    content: 'Quickly find services, records, and documentation right from here.',
                    nextBtn: 'Next',
                  },
                  am: {
                    title: 'ፈጣን ዓለም አቀፍ ፍለጋ',
                    content: 'አገልግሎቶችን፣ መዛግብቶችን እና መረጃዎችን በፍጥነት እዚህ ያግኙ።',
                    nextBtn: 'ቀጣይ',
                  },
                  om: {
                    title: 'Barbaacha Saffisaa',
                    content: 'Tajaajiloota fi galmeewwan kallattiin asii barbaadaa.',
                    nextBtn: 'Itti Fufi',
                  },
                },
              },
              {
                stepIndex: 1,
                targetSelector: '#language-switcher',
                placement: StepPlacement.BOTTOM,
                requiredAction: StepAction.NONE,
                i18n: {
                  en: {
                    title: 'Multilingual Support',
                    content: 'Switch languages anytime. The walkthrough adapts dynamically.',
                    nextBtn: 'Got it!',
                    backBtn: 'Back',
                  },
                  am: {
                    title: 'የብዙ ቋንቋዎች ድጋፍ',
                    content: 'ቋንቋዎችን በማንኛውም ጊዜ ይቀይሩ። የመመሪያው ይዘት ወዲያውኑ ይስተካከላል።',
                    nextBtn: 'ገባኝ!',
                    backBtn: 'ተመለስ',
                  },
                  om: {
                    title: 'Deggersa Afaanii',
                    content: 'Afaan kamiyyuu filadhaa. Tajaajilli kun battalumatti jijjiirama.',
                    nextBtn: 'Hubadheera!',
                    backBtn: 'Duubatti',
                  },
                },
              },
            ],
          },
        },
      });

      projects.push({
        ...newProject,
        organizationName: org.name,
        organizationRole: OrgRole.OWNER,
      });
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

  async revokeApiKey(projectId: string, keyId: string) {
    const key = await this.prisma.client.apiKey.findFirst({
      where: { id: keyId, projectId },
    });
    if (!key) {
      throw new NotFoundException('API Key not found for this project.');
    }
    return this.prisma.client.apiKey.update({
      where: { id: keyId },
      data: {
        status: KeyStatus.REVOKED,
        revokedAt: new Date(),
      },
    });
  }

  async updateProject(projectId: string, data: { name?: string; domains?: string[] }) {
    return this.prisma.client.project.update({
      where: { id: projectId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.domains !== undefined && { domains: data.domains }),
      },
      include: { apiKeys: true, _count: { select: { tours: true } } },
    });
  }

  async deleteProject(projectId: string) {
    // Delete in dependency order to satisfy FK constraints
    // 1. Delete analytics events for this project
    await this.prisma.client.analyticsEvent.deleteMany({ where: { projectId } });
    // 2. Delete tour steps
    await this.prisma.client.tourStep.deleteMany({
      where: { tour: { projectId } },
    });
    // 3. Delete tours
    await this.prisma.client.tour.deleteMany({ where: { projectId } });
    // 4. Delete API keys
    await this.prisma.client.apiKey.deleteMany({ where: { projectId } });
    // 5. Delete the project itself
    return this.prisma.client.project.delete({ where: { id: projectId } });
  }
}
