import { FlowKitConfig, OnboardFlowConfig, TourData, TourStepData } from './types';
import { TourOverlay } from './overlay';
import { TelemetryService } from './telemetry';
import { normalizeLocale } from './i18n';
import { LiveBuilder } from './builder';

export * from './types';
export { TourOverlay } from './overlay';
export { TelemetryService } from './telemetry';
export { LiveBuilder } from './builder';

export class FlowKit {
  private static instance: FlowKit | null = null;
  private config: FlowKitConfig;
  private tours: Map<string, TourData> = new Map();
  private activeTour: TourData | null = null;
  private currentStepIndex: number = 0;
  private overlay: TourOverlay;
  private telemetry: TelemetryService;
  private activeLocale: string;
  private builder: LiveBuilder | null = null;

  constructor(config: FlowKitConfig) {
    this.config = {
      ...config,
      apiUrl: config.apiUrl || 'http://localhost:4000',
      autoStart: config.autoStart !== false,
      isAdmin: config.isAdmin ?? false,
    };
    this.activeLocale = normalizeLocale(this.config.locale);
    this.telemetry = new TelemetryService(this.config.apiUrl, this.config.apiKey);
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
      this.attachNavigationListeners();

      // If user is Admin (WordPress style), automatically show the Flow-Kit Builder bar
      if (this.config.isAdmin) {
        this.openLiveBuilder();
      }

      // Check if Live Builder mode requested via URL parameter or hash
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const isBuilder =
          urlParams.get('flowkit_builder') === 'true' ||
          window.location.hash.includes('flowkit_builder');
        const tourIdParam = urlParams.get('tourId') || undefined;

        if (isBuilder && this.config.isAdmin) {
          this.openLiveBuilder(tourIdParam);
        }

        // Global hotkey: Ctrl + Shift + F (Admin only) to toggle visual builder
        window.addEventListener('keydown', (e) => {
          if (e.ctrlKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
            if (!this.config.isAdmin) return;
            e.preventDefault();
            this.openLiveBuilder();
          }
        });
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[OnboardFlow] Bootstrap notice:', err);
      }
    }
  }

  private attachNavigationListeners() {
    if (typeof window === 'undefined' || (window as any).__flowkit_nav_attached) return;
    (window as any).__flowkit_nav_attached = true;

    const onNavigate = async () => {
      if (this.activeTour) return;
      await this.fetchTours();
      if (this.config.autoStart !== false) {
        this.evaluateAutoStart();
      }
    };

    const origPushState = history.pushState;
    const self = this;
    history.pushState = function (...args) {
      origPushState.apply(this, args);
      setTimeout(() => onNavigate(), 60);
    };

    const origReplaceState = history.replaceState;
    history.replaceState = function (...args) {
      origReplaceState.apply(this, args);
      setTimeout(() => onNavigate(), 60);
    };

    window.addEventListener('popstate', () => {
      setTimeout(() => onNavigate(), 60);
    });
  }

  public async fetchTours(): Promise<TourData[]> {
    try {
      const currentPath =
        typeof window !== 'undefined' && window.location ? window.location.pathname : '/';
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
      console.warn('[FlowKit] Failed to fetch tours from API:', e);
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
        } else {
          console.info(`[FlowKit] Tour "${tour.slug}" was already seen. Use window.flowKitInstance.startTour("${tour.slug}") to replay it.`);
        }
      }
    }
  }

  public resetSeenTours(): void {
    this.telemetry.resetSeenTours();
  }

  public registerTour(tour: TourData) {
    if (tour && tour.slug) {
      if (tour.steps) {
        tour.steps.sort((a, b) => a.stepIndex - b.stepIndex);
      }
      this.tours.set(tour.slug, tour);
    }
  }

  public startTour(slug: string, tourOverride?: TourData): boolean {
    if (tourOverride) {
      this.registerTour(tourOverride);
    }
    const tour = this.tours.get(slug) || tourOverride;
    if (!tour || !tour.steps || tour.steps.length === 0) {
      console.warn(`[FlowKit] Tour "${slug}" not found or has no steps.`);
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

  public setAdmin(isAdmin: boolean) {
    this.config.isAdmin = isAdmin;
    if (this.builder) {
      this.builder.setAdmin(isAdmin);
    } else if (isAdmin) {
      this.openLiveBuilder();
    }
  }

  public openLiveBuilder(activeTourId?: string) {
    if (!this.config.isAdmin) {
      console.warn('[FlowKit] Builder mode is restricted to administrators.');
      return;
    }
    this.builder = LiveBuilder.getInstance({
      apiKey: this.config.apiKey,
      apiUrl: this.config.apiUrl,
      activeTourId,
      isAdmin: true,
      onTourUpdated: () => {
        this.fetchTours();
      },
    });
    this.builder.setAdmin(true);
    this.builder.start();
  }
}

export const OnboardFlow = FlowKit;
export type OnboardFlow = FlowKit;
export default FlowKit;
