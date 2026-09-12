import { FlowKitConfig, OnboardFlowConfig, TourData, TourStepData } from './types';
import { TourOverlay } from './overlay';
import { TelemetryService } from './telemetry';
import { normalizeLocale } from './i18n';

export * from './types';
export { TourOverlay } from './overlay';
export { TelemetryService } from './telemetry';

export class FlowKit {
  private static instance: FlowKit | null = null;
  private config: FlowKitConfig;
  private tours: Map<string, TourData> = new Map();
  private activeTour: TourData | null = null;
  private currentStepIndex: number = 0;
  private overlay: TourOverlay;
  private telemetry: TelemetryService;
  private activeLocale: string;

  constructor(config: FlowKitConfig) {
    this.config = {
      apiUrl: 'http://localhost:4000',
      autoStart: true,
      ...config,
    };
    this.activeLocale = normalizeLocale(this.config.locale);
    this.telemetry = new TelemetryService(this.config.apiUrl!, this.config.apiKey);
    this.overlay = new TourOverlay({
      onNext: () => this.nextStep(),
      onPrev: () => this.prevStep(),
      onSkip: () => this.dismissTour(),
    });
  }

  public static init(config: FlowKitConfig): FlowKit {
    if (!FlowKit.instance) {
      FlowKit.instance = new FlowKit(config);
      FlowKit.instance.bootstrap();
    }
    return FlowKit.instance;
  }

  public static getInstance(): FlowKit | null {
    return FlowKit.instance;
  }

  private async bootstrap() {
    try {
      await this.fetchTours();
      if (this.config.autoStart !== false) {
        this.evaluateAutoStart();
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[OnboardFlow] Bootstrap notice:', err);
      }
    }
  }

  public async fetchTours(): Promise<TourData[]> {
    try {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      const url = `${this.config.apiUrl}/v1/public/tours?url=${encodeURIComponent(currentPath)}`;
      const res = await fetch(url, {
        headers: {
          'x-api-key': this.config.apiKey,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch tours: ${res.status}`);
      }

      const data = await res.json();
      const toursList: TourData[] = Array.isArray(data) ? data : data.tours || [];

      this.tours.clear();
      for (const tour of toursList) {
        // Sort steps ascending by stepIndex
        if (tour.steps) {
          tour.steps.sort((a, b) => a.stepIndex - b.stepIndex);
        }
        this.tours.set(tour.slug, tour);
      }

      return toursList;
    } catch (e) {
      return [];
    }
  }

  private evaluateAutoStart() {
    for (const tour of this.tours.values()) {
      if (tour.status !== 'PUBLISHED') continue;
      if (tour.triggerType === 'AUTO_FIRST_VISIT') {
        const hasSeen = this.telemetry.hasSeenTour(tour.slug);
        if (!hasSeen) {
          this.startTour(tour.slug);
          break;
        }
      }
    }
  }

  public startTour(slug: string): boolean {
    const tour = this.tours.get(slug);
    if (!tour || !tour.steps || tour.steps.length === 0) {
      console.warn(`[OnboardFlow] Tour "${slug}" not found or has no steps.`);
      return false;
    }

    this.activeTour = tour;
    this.currentStepIndex = 0;

    // Telemetry event
    this.telemetry.track('TOUR_STARTED', tour.id, {
      locale: this.activeLocale,
    });

    if (this.config.onTourStart) {
      this.config.onTourStart(tour);
    }

    this.renderCurrentStep();
    return true;
  }

  private renderCurrentStep() {
    if (!this.activeTour) return;

    const step = this.activeTour.steps[this.currentStepIndex];
    if (!step) return;

    // Telemetry for step view
    this.telemetry.track('STEP_VIEWED', this.activeTour.id, {
      tourStepId: step.id,
      locale: this.activeLocale,
    });

    if (this.config.onStepChange) {
      this.config.onStepChange(step, this.currentStepIndex);
    }

    this.overlay.renderStep(this.activeTour, step, this.activeLocale);
  }

  public nextStep() {
    if (!this.activeTour) return;

    const currentStep = this.activeTour.steps[this.currentStepIndex];
    if (currentStep) {
      this.telemetry.track('STEP_COMPLETED', this.activeTour.id, {
        tourStepId: currentStep.id,
        locale: this.activeLocale,
      });
    }

    if (this.currentStepIndex < this.activeTour.steps.length - 1) {
      this.currentStepIndex++;
      this.renderCurrentStep();
    } else {
      this.completeTour();
    }
  }

  public prevStep() {
    if (!this.activeTour || this.currentStepIndex <= 0) return;
    this.currentStepIndex--;
    this.renderCurrentStep();
  }

  public completeTour() {
    if (!this.activeTour) return;

    const tour = this.activeTour;
    this.telemetry.track('TOUR_COMPLETED', tour.id, {
      locale: this.activeLocale,
    });
    this.telemetry.markTourSeen(tour.slug);
    this.telemetry.flush();

    if (this.config.onTourComplete) {
      this.config.onTourComplete(tour);
    }

    this.closeOverlay();
  }

  public dismissTour() {
    if (!this.activeTour) return;

    const tour = this.activeTour;
    this.telemetry.track('TOUR_SKIPPED', tour.id, {
      tourStepId: tour.steps[this.currentStepIndex]?.id,
      locale: this.activeLocale,
    });
    this.telemetry.markTourSeen(tour.slug);
    this.telemetry.flush();

    if (this.config.onTourDismiss) {
      this.config.onTourDismiss(tour);
    }

    this.closeOverlay();
  }

  private closeOverlay() {
    this.overlay.unmount();
    this.activeTour = null;
    this.currentStepIndex = 0;
  }

  public setLocale(locale: string) {
    this.activeLocale = normalizeLocale(locale);
    if (this.activeTour) {
      this.renderCurrentStep();
    }
  }

  public getLocale(): string {
    return this.activeLocale;
  }

  public getAvailableTours(): TourData[] {
    return Array.from(this.tours.values());
  }
}

export const OnboardFlow = FlowKit;
export type OnboardFlow = FlowKit;
export default FlowKit;
