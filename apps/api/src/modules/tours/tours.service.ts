import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { TourStatus, TriggerType, StepPlacement, StepAction } from '@flow-kit/database';

@Injectable()
export class ToursService {
  constructor(private readonly prisma: PrismaService) {}

  async getTours(projectId: string) {
    return this.prisma.client.tour.findMany({
      where: { projectId },
      include: {
        steps: { orderBy: { stepIndex: 'asc' } },
        _count: {
          select: { events: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTour(tourId: string) {
    const tour = await this.prisma.client.tour.findUnique({
      where: { id: tourId },
      include: {
        steps: { orderBy: { stepIndex: 'asc' } },
        project: true,
      },
    });
    if (!tour) throw new NotFoundException('Tour not found');
    return tour;
  }

  async createTour(projectId: string, data: {
    title: string;
    slug?: string;
    description?: string;
    triggerType?: TriggerType;
    targetUrlPattern?: string;
    defaultLocale?: string;
    isDismissable?: boolean;
    allowBackdropClick?: boolean;
    themeConfig?: any;
    steps?: Array<{
      stepIndex: number;
      targetSelector: string;
      placement?: StepPlacement;
      requiredAction?: StepAction;
      backdropConfig?: any;
      advanceOnSelectorClick?: boolean;
      i18n: any;
    }>;
  }) {
    const slug = (data.slug || data.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return this.prisma.client.$transaction(async (tx) => {
      const tour = await tx.tour.create({
        data: {
          projectId,
          slug,
          title: data.title,
          description: data.description,
          triggerType: data.triggerType || TriggerType.AUTO_FIRST_VISIT,
          targetUrlPattern: data.targetUrlPattern || '*',
          defaultLocale: data.defaultLocale || 'en',
          isDismissable: data.isDismissable ?? true,
          allowBackdropClick: data.allowBackdropClick ?? false,
          themeConfig: data.themeConfig || { primaryColor: '#2563eb' },
          status: TourStatus.DRAFT,
        },
      });

      if (data.steps && data.steps.length > 0) {
        await tx.tourStep.createMany({
          data: data.steps.map((s, idx) => {
            const raw = (s.placement || 'BOTTOM').toString().toUpperCase().replace('-', '_');
            const dbPlacement = (['TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'CENTER'].includes(raw)
              ? (raw as StepPlacement)
              : raw.startsWith('TOP') ? StepPlacement.TOP : StepPlacement.BOTTOM);
            return {
              tourId: tour.id,
              stepIndex: s.stepIndex ?? idx + 1,
              targetSelector: s.targetSelector,
              placement: dbPlacement,
              requiredAction: s.requiredAction || StepAction.NONE,
              backdropConfig: {
                ...(s.backdropConfig || { dimOpacity: 0.65 }),
                placement: raw,
              },
              advanceOnSelectorClick: s.advanceOnSelectorClick ?? false,
              i18n: s.i18n,
            };
          }),
        });
      }

      return tx.tour.findUnique({
        where: { id: tour.id },
        include: { steps: { orderBy: { stepIndex: 'asc' } } },
      });
    });
  }

  async updateTour(tourId: string, data: {
    title?: string;
    description?: string;
    triggerType?: TriggerType;
    targetUrlPattern?: string;
    defaultLocale?: string;
    isDismissable?: boolean;
    allowBackdropClick?: boolean;
    status?: TourStatus;
    themeConfig?: any;
    steps?: Array<{
      stepIndex: number;
      targetSelector: string;
      placement?: any;
      requiredAction?: StepAction;
      backdropConfig?: any;
      advanceOnSelectorClick?: boolean;
      i18n: any;
    }>;
  }) {
    return this.prisma.client.$transaction(async (tx) => {
      const tour = await tx.tour.update({
        where: { id: tourId },
        data: {
          title: data.title,
          description: data.description,
          triggerType: data.triggerType,
          targetUrlPattern: data.targetUrlPattern,
          defaultLocale: data.defaultLocale,
          isDismissable: data.isDismissable,
          allowBackdropClick: data.allowBackdropClick,
          status: data.status,
          themeConfig: data.themeConfig,
        },
      });

      if (data.steps) {
        // Re-sync steps
        await tx.tourStep.deleteMany({ where: { tourId } });
        if (data.steps.length > 0) {
          await tx.tourStep.createMany({
            data: data.steps.map((s, idx) => {
              const raw = (s.placement || 'BOTTOM').toString().toUpperCase().replace('-', '_');
              const dbPlacement = (['TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'CENTER'].includes(raw)
                ? (raw as StepPlacement)
                : raw.startsWith('TOP') ? StepPlacement.TOP : StepPlacement.BOTTOM);
              return {
                tourId,
                stepIndex: s.stepIndex ?? idx + 1,
                targetSelector: s.targetSelector,
                placement: dbPlacement,
                requiredAction: s.requiredAction || StepAction.NONE,
                backdropConfig: {
                  ...(s.backdropConfig || { dimOpacity: 0.65 }),
                  placement: raw,
                },
                advanceOnSelectorClick: s.advanceOnSelectorClick ?? false,
                i18n: s.i18n,
              };
            }),
          });
        }
      }

      return tx.tour.findUnique({
        where: { id: tourId },
        include: { steps: { orderBy: { stepIndex: 'asc' } } },
      });
    });
  }

  async publishTour(tourId: string) {
    return this.prisma.client.tour.update({
      where: { id: tourId },
      data: { status: TourStatus.PUBLISHED },
    });
  }

  async archiveTour(tourId: string) {
    return this.prisma.client.tour.update({
      where: { id: tourId },
      data: { status: TourStatus.ARCHIVED },
    });
  }

  async deleteTour(tourId: string) {
    return this.prisma.client.tour.delete({
      where: { id: tourId },
    });
  }
}
