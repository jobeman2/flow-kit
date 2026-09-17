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
}
