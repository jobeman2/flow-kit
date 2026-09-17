import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { AnalyticsEventType } from '@flow-kit/database';

@Injectable()
export class AnalyticsService {
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
      throw new ForbiddenException('Access denied: You do not have permission to access analytics for this project.');
    }
    return project;
  }

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

  async getProjectAnalyticsOverview(projectId: string) {
    // 1. Get all tours for this project with steps
    const tours = await this.prisma.client.tour.findMany({
      where: { projectId },
      include: {
        steps: { select: { id: true, i18n: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Determine unique locales configured across all tours/steps
    const localesSet = new Set<string>();
    for (const tour of tours) {
      if (tour.defaultLocale) localesSet.add(tour.defaultLocale.toLowerCase());
      for (const step of tour.steps) {
        if (step.i18n && typeof step.i18n === 'object') {
          Object.keys(step.i18n).forEach((loc) => localesSet.add(loc.toLowerCase()));
        }
      }
    }
    const uniqueLocales = Array.from(localesSet);

    // 2. Aggregate counts by eventType for the whole project
    const counts = await this.prisma.client.analyticsEvent.groupBy({
      by: ['eventType'],
      where: { projectId },
      _count: { id: true },
    });

    const countMap: Record<string, number> = {};
    for (const c of counts) {
      countMap[c.eventType] = c._count.id;
    }

    const totalStarted = countMap[AnalyticsEventType.TOUR_STARTED] || 0;
    const totalCompleted = countMap[AnalyticsEventType.TOUR_COMPLETED] || 0;
    const totalSkipped = countMap[AnalyticsEventType.TOUR_SKIPPED] || 0;
    const totalStepViews = countMap[AnalyticsEventType.STEP_VIEWED] || 0;
    const totalEvents = Object.values(countMap).reduce((a, b) => a + b, 0);

    const averageCompletionRate =
      totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0;

    // 3. Per-tour breakdown stats
    const tourEvents = await this.prisma.client.analyticsEvent.groupBy({
      by: ['tourId', 'eventType'],
      where: { projectId },
      _count: { id: true },
    });

    const tourEventMap: Record<string, Record<string, number>> = {};
    for (const te of tourEvents) {
      if (!tourEventMap[te.tourId]) {
        tourEventMap[te.tourId] = {};
      }
      tourEventMap[te.tourId][te.eventType] = te._count.id;
    }

    const tourBreakdown = tours.map((tour) => {
      const m = tourEventMap[tour.id] || {};
      const starts = m[AnalyticsEventType.TOUR_STARTED] || 0;
      const completions = m[AnalyticsEventType.TOUR_COMPLETED] || 0;
      const skips = m[AnalyticsEventType.TOUR_SKIPPED] || 0;
      const views = m[AnalyticsEventType.STEP_VIEWED] || 0;
      const rate = starts > 0 ? Math.round((completions / starts) * 100) : 0;

      return {
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
        status: tour.status,
        targetUrlPattern: tour.targetUrlPattern,
        stepsCount: tour.steps.length,
        starts,
        completions,
        skips,
        views,
        completionRate: rate,
        createdAt: tour.createdAt,
      };
    });

    // 4. Live recent activity stream (latest 30 events)
    const recentEvents = await this.prisma.client.analyticsEvent.findMany({
      where: { projectId },
      include: {
        tour: { select: { title: true, slug: true } },
        step: { select: { stepIndex: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const formattedRecentEvents = recentEvents.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      tourId: e.tourId,
      tourTitle: e.tour?.title || 'Unknown Tour',
      tourSlug: e.tour?.slug,
      stepIndex: e.step?.stepIndex || null,
      locale: e.locale,
      path: e.path,
      anonymousUserId: e.anonymousUserId,
      createdAt: e.createdAt,
    }));

    // 5. Daily traffic timeline (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyEvents = await this.prisma.client.analyticsEvent.findMany({
      where: {
        projectId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        eventType: true,
        createdAt: true,
      },
    });

    const dailyMap: Record<string, { date: string; fullDate: string; starts: number; completions: number; total: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateKey = d.toISOString().split('T')[0];
      const displayDay = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      dailyMap[dateKey] = { date: displayDay, fullDate: dateKey, starts: 0, completions: 0, total: 0 };
    }

    for (const ev of dailyEvents) {
      const dateKey = ev.createdAt.toISOString().split('T')[0];
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].total++;
        if (ev.eventType === AnalyticsEventType.TOUR_STARTED) dailyMap[dateKey].starts++;
        if (ev.eventType === AnalyticsEventType.TOUR_COMPLETED) dailyMap[dateKey].completions++;
      }
    }

    return {
      totalStarted,
      totalCompleted,
      totalSkipped,
      totalStepViews,
      totalEvents,
      averageCompletionRate,
      uniqueLocales: uniqueLocales.length > 0 ? uniqueLocales : ['en'],
      tourBreakdown,
      recentEvents: formattedRecentEvents,
      dailyTimeline: Object.values(dailyMap),
    };
  }
}
