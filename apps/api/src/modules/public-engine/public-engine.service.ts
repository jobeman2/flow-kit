import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { TourStatus, AnalyticsEventType } from '@flow-kit/database';

@Injectable()
export class PublicEngineService {
  private readonly logger = new Logger(PublicEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates if targetUrlPattern matches the user's current URL pathname
   */
  private matchUrlPattern(pattern: string, urlPath: string): boolean {
    if (!pattern || pattern === '*' || pattern === '/*') return true;

    // Convert glob pattern to regex: e.g. /tickets/* -> ^/tickets/.*$
    const cleanPattern = pattern.trim();
    const regexPattern = cleanPattern
      .replace(/\*/g, '.*')
      .replace(/\/:([a-zA-Z0-9_]+)/g, '/[^/]+');

    try {
      const regex = new RegExp(`^${regexPattern}$`, 'i');
      return regex.test(urlPath);
    } catch {
      return urlPath.startsWith(pattern.replace('*', ''));
    }
  }

  async resolveTours(projectId: string, urlPath: string = '/') {
    const publishedTours = await this.prisma.client.tour.findMany({
      where: {
        projectId,
        status: TourStatus.PUBLISHED,
      },
      include: {
        steps: {
          orderBy: { stepIndex: 'asc' },
        },
      },
    });

    // Filter by matching URL path
    const matchingTours = publishedTours.filter((tour) =>
      this.matchUrlPattern(tour.targetUrlPattern, urlPath),
    );

    return matchingTours;
  }

  async ingestEvents(
    projectId: string,
    events: Array<{
      tourId: string;
      tourStepId?: string;
      eventType: AnalyticsEventType;
      anonymousUserId: string;
      locale?: string;
      path?: string;
      userMetadata?: any;
      clientTimestamp?: string;
    }>,
  ) {
    if (!events || !Array.isArray(events) || events.length === 0) {
      return { success: true, ingested: 0 };
    }

    // Limit batch size to 50 events to prevent memory exhaustion & DoS
    const batch = events.slice(0, 50);

    const records = batch.map((ev) => {
      let safeMetadata = null;
      if (ev.userMetadata && typeof ev.userMetadata === 'object') {
        try {
          const str = JSON.stringify(ev.userMetadata);
          if (str.length <= 4096) {
            safeMetadata = ev.userMetadata;
          }
        } catch {}
      }

      let parsedDate = new Date();
      if (ev.clientTimestamp) {
        const d = new Date(ev.clientTimestamp);
        if (!isNaN(d.getTime())) parsedDate = d;
      }

      return {
        projectId,
        tourId: String(ev.tourId || '').substring(0, 64),
        tourStepId: ev.tourStepId ? String(ev.tourStepId).substring(0, 64) : null,
        eventType: ev.eventType,
        anonymousUserId: String(ev.anonymousUserId || 'anon_unknown').substring(0, 128),
        locale: String(ev.locale || 'en').substring(0, 16),
        path: String(ev.path || '/').substring(0, 512),
        userMetadata: safeMetadata,
        clientTimestamp: parsedDate,
      };
    });

    // Ingest events
    const result = await this.prisma.client.analyticsEvent.createMany({
      data: records,
      skipDuplicates: true,
    });

    return { success: true, ingested: result.count };
  }

  async getAllTours(projectId: string) {
    return this.prisma.client.tour.findMany({
      where: { projectId },
      include: {
        steps: {
          orderBy: { stepIndex: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async addStepFromBuilder(
    projectId: string,
    tourId: string,
    data: {
      targetSelector: string;
      placement?: string;
      title: string;
      content: string;
      nextBtn?: string;
      backBtn?: string;
    },
  ) {
    const tour = await this.prisma.client.tour.findFirst({
      where: { id: tourId, projectId },
      include: { steps: true },
    });
    if (!tour) {
      throw new Error('Tour not found or access denied for this project');
    }

    const nextIndex = tour.steps.length + 1;
    const rawPlacement = (data.placement || 'BOTTOM').toUpperCase().replace('-', '_');
    const dbPlacement = (['TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'CENTER'].includes(rawPlacement)
      ? (rawPlacement as any)
      : rawPlacement.startsWith('TOP')
      ? 'TOP'
      : rawPlacement.startsWith('BOTTOM')
      ? 'BOTTOM'
      : rawPlacement.startsWith('LEFT')
      ? 'LEFT'
      : 'RIGHT');

    await this.prisma.client.tourStep.create({
      data: {
        tourId: tour.id,
        stepIndex: nextIndex,
        targetSelector: data.targetSelector || 'body',
        placement: dbPlacement as any,
        requiredAction: 'NONE' as any,
        backdropConfig: {
          dimOpacity: 0.65,
          placement: rawPlacement,
        },
        advanceOnSelectorClick: false,
        i18n: {
          [tour.defaultLocale || 'en']: {
            title: data.title || `Step ${nextIndex}`,
            content: data.content || '',
            nextBtn: data.nextBtn || (nextIndex === 1 ? 'Start' : 'Next'),
            backBtn: data.backBtn || 'Back',
          },
        },
      },
    });

    return this.prisma.client.tour.findUnique({
      where: { id: tour.id },
      include: {
        steps: { orderBy: { stepIndex: 'asc' } },
      },
    });
  }

  async addStepsFromBuilder(
    projectId: string,
    tourId: string,
    steps: Array<{
      targetSelector: string;
      placement?: string;
      title: string;
      content: string;
      nextBtn?: string;
      backBtn?: string;
    }>,
  ) {
    const tour = await this.prisma.client.tour.findFirst({
      where: { id: tourId, projectId },
      include: { steps: true },
    });
    if (!tour) {
      throw new Error('Tour not found or access denied for this project');
    }

    let currentIndex = tour.steps.length;
    for (const stepData of steps) {
      currentIndex += 1;
      const rawPlacement = (stepData.placement || 'BOTTOM').toUpperCase().replace('-', '_');
      const dbPlacement = (['TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'CENTER'].includes(rawPlacement)
        ? (rawPlacement as any)
        : rawPlacement.startsWith('TOP')
        ? 'TOP'
        : rawPlacement.startsWith('BOTTOM')
        ? 'BOTTOM'
        : rawPlacement.startsWith('LEFT')
        ? 'LEFT'
        : 'RIGHT');

      await this.prisma.client.tourStep.create({
        data: {
          tourId: tour.id,
          stepIndex: currentIndex,
          targetSelector: stepData.targetSelector || 'body',
          placement: dbPlacement as any,
          requiredAction: 'NONE' as any,
          backdropConfig: {
            dimOpacity: 0.65,
            placement: rawPlacement,
          },
          advanceOnSelectorClick: false,
          i18n: {
            [tour.defaultLocale || 'en']: {
              title: stepData.title || `Step ${currentIndex}`,
              content: stepData.content || '',
              nextBtn: stepData.nextBtn || (currentIndex === 1 ? 'Start' : 'Next'),
              backBtn: stepData.backBtn || 'Back',
            },
          },
        },
      });
    }

    return this.prisma.client.tour.findUnique({
      where: { id: tour.id },
      include: {
        steps: { orderBy: { stepIndex: 'asc' } },
      },
    });
  }
}

