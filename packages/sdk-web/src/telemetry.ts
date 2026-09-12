import { TelemetryEventType, TelemetryPayload } from './types';

const STORAGE_ANON_ID = 'onboardflow_anon_user_id';
const STORAGE_SEEN_TOURS = 'onboardflow_seen_tours';

export class TelemetryService {
  private apiUrl: string;
  private apiKey: string;
  private anonymousUserId: string;
  private queue: TelemetryPayload[] = [];
  private flushTimer: any = null;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.anonymousUserId = this.getOrCreateAnonymousId();
  }

  private getOrCreateAnonymousId(): string {
    try {
      let id = localStorage.getItem(STORAGE_ANON_ID);
      if (!id) {
        id = 'anon_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        localStorage.setItem(STORAGE_ANON_ID, id);
      }
      return id;
    } catch {
      return 'anon_' + Math.random().toString(36).substring(2, 11);
    }
  }

  public getAnonymousUserId(): string {
    return this.anonymousUserId;
  }

  public hasSeenTour(tourSlug: string): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_SEEN_TOURS);
      if (!raw) return false;
      const list = JSON.parse(raw);
      return Array.isArray(list) && list.includes(tourSlug);
    } catch {
      return false;
    }
  }

  public markTourSeen(tourSlug: string): void {
    try {
      const raw = localStorage.getItem(STORAGE_SEEN_TOURS);
      const list = raw ? JSON.parse(raw) : [];
      if (!list.includes(tourSlug)) {
        list.push(tourSlug);
        localStorage.setItem(STORAGE_SEEN_TOURS, JSON.stringify(list));
      }
    } catch {
      // ignore
    }
  }

  public track(
    eventType: TelemetryEventType,
    tourId: string,
    options: {
      tourStepId?: string;
      locale?: string;
      userMetadata?: Record<string, any>;
    } = {}
  ): void {
    const payload: TelemetryPayload = {
      tourId,
      tourStepId: options.tourStepId,
      eventType,
      anonymousUserId: this.anonymousUserId,
      locale: options.locale || 'en',
      path: typeof window !== 'undefined' ? window.location.pathname : '/',
      userMetadata: options.userMetadata,
      clientTimestamp: new Date().toISOString(),
    };

    this.queue.push(payload);

    if (this.queue.length >= 5) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), 1500);
    }
  }

  public flush(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    const url = `${this.apiUrl}/v1/public/events`;
    const body = JSON.stringify({ events: eventsToSend });

    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        const success = navigator.sendBeacon(url + `?apiKey=${encodeURIComponent(this.apiKey)}`, blob);
        if (success) return;
      }

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body,
        keepalive: true,
      }).catch((err) => {
        // Silent fail telemetry to prevent interrupting host app
        if (process.env.NODE_ENV === 'development') {
          console.debug('[OnboardFlow] Telemetry sync error:', err);
        }
      });
    } catch {
      // Silent catch
    }
  }
}
