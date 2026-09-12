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
      return { success: true, count: 0 };
    }

    const records = events.map((ev) => ({
      projectId,
      tourId: ev.tourId,
      tourStepId: ev.tourStepId || null,
      eventType: ev.eventType,
      anonymousUserId: ev.anonymousUserId || 'anon_unknown',
      locale: ev.locale || 'en',
      path: ev.path || '/',
      userMetadata: ev.userMetadata || null,
      clientTimestamp: ev.clientTimestamp ? new Date(ev.clientTimestamp) : new Date(),
    }));

    // Ingest events
    const result = await this.prisma.client.analyticsEvent.createMany({
      data: records,
      skipDuplicates: true,
    });

    return { success: true, ingested: result.count };
  }
}
