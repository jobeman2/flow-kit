import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { AnalyticsEventType } from '@flow-kit/database';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTourFunnel(projectId: string, tourId?: string) {
    // If no tourId specified, pick the most recent published tour or any tour
    let targetTourId = tourId;
    if (!targetTourId) {
      const firstTour = await this.prisma.client.tour.findFirst({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });
      if (!firstTour) {
        return {
          totalStarted: 0,
          totalCompleted: 0,
          totalSkipped: 0,
          completionRate: 0,
          steps: [],
          recentEvents: [],
        };
      }
      targetTourId = firstTour.id;
    }

    const tour = await this.prisma.client.tour.findUnique({
      where: { id: targetTourId },
      include: {
        steps: { orderBy: { stepIndex: 'asc' } },
      },
    });

    if (!tour) {
      return {
        totalStarted: 0,
        totalCompleted: 0,
        totalSkipped: 0,
        completionRate: 0,
        steps: [],
        recentEvents: [],
      };
    }

    // Aggregate counts by eventType for this tour
    const counts = await this.prisma.client.analyticsEvent.groupBy({
      by: ['eventType'],
      where: { tourId: targetTourId },
      _count: { id: true },
    });

    const countMap: Record<string, number> = {};
    for (const c of counts) {
      countMap[c.eventType] = c._count.id;
    }

    const totalStarted = countMap[AnalyticsEventType.TOUR_STARTED] || 0;
    const totalCompleted = countMap[AnalyticsEventType.TOUR_COMPLETED] || 0;
    const totalSkipped = countMap[AnalyticsEventType.TOUR_SKIPPED] || 0;
    const completionRate =
      totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0;

    // Aggregate step completions
    const stepCounts = await this.prisma.client.analyticsEvent.groupBy({
      by: ['tourStepId', 'eventType'],
      where: {
        tourId: targetTourId,
        tourStepId: { not: null },
      },
      _count: { id: true },
    });

    const stepMap: Record<string, { viewed: number; completed: number }> = {};
    for (const sc of stepCounts) {
      if (!sc.tourStepId) continue;
      if (!stepMap[sc.tourStepId]) {
        stepMap[sc.tourStepId] = { viewed: 0, completed: 0 };
      }
      if (sc.eventType === AnalyticsEventType.STEP_VIEWED) {
        stepMap[sc.tourStepId].viewed = sc._count.id;
      } else if (sc.eventType === AnalyticsEventType.STEP_COMPLETED) {
        stepMap[sc.tourStepId].completed = sc._count.id;
      }
    }

    const funnelSteps = tour.steps.map((s, idx) => {
      const stats = stepMap[s.id] || { viewed: 0, completed: 0 };
      const stepTitle = (s.i18n as any)?.en?.title || (s.i18n as any)?.am?.title || `Step ${s.stepIndex}`;
      const dropOffRate =
        stats.viewed > 0
          ? Math.max(0, Math.round(((stats.viewed - stats.completed) / stats.viewed) * 100))
          : 0;

      return {
        stepId: s.id,
        stepIndex: s.stepIndex,
        title: stepTitle,
        selector: s.targetSelector,
        viewed: stats.viewed,
        completed: stats.completed,
        dropOffRate,
      };
    });

    // Recent events log
    const recentEvents = await this.prisma.client.analyticsEvent.findMany({
      where: { tourId: targetTourId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      tour: {
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
      },
      totalStarted,
      totalCompleted,
      totalSkipped,
      completionRate,
      steps: funnelSteps,
      recentEvents,
    };
  }
}
