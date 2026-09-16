import { TourStepData, TourData, StepPlacement } from './types';
import { calculatePosition, findTargetElement, scrollElementIntoView } from './positioning';
import { resolveStepI18n } from './i18n';

export interface OverlayCallbacks {
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onTargetClick?: () => void;
}

export class TourOverlay {
  private containerEl: HTMLDivElement | null = null;
  private svgMaskEl: SVGSVGElement | null = null;
  private cutoutRectEl: SVGRectElement | null = null;
  private backdropRectEl: SVGRectElement | null = null;
  private tooltipEl: HTMLDivElement | null = null;
  private callbacks: OverlayCallbacks;
  private currentStep: TourStepData | null = null;
  private currentTour: TourData | null = null;
  private currentLocale: string = 'en';
  private resizeObserver: ResizeObserver | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(callbacks: OverlayCallbacks) {
    this.callbacks = callbacks;
  }

  public mount() {
    if (this.containerEl) return;

    // Inject DM Sans font for consistent walkthrough typography across any embedding site
    if (typeof document !== 'undefined' && !document.getElementById('onboardflow-font-dmsans')) {
      const fontLink = document.createElement('link');
      fontLink.id = 'onboardflow-font-dmsans';
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap';
      document.head.appendChild(fontLink);
    }

    this.containerEl = document.createElement('div');
    this.containerEl.id = 'onboardflow-root';
    this.containerEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 999999;
      pointer-events: none;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    `;

    // SVG Mask for Spotlight Cutout
    const maskSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    maskSvg.setAttribute('width', '100%');
    maskSvg.setAttribute('height', '100%');
    maskSvg.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: auto;
    `;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
    mask.id = 'onboardflow-spotlight-mask';

    // Full white rectangle (covers viewport with dark backdrop)
    const fullWhiteRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    fullWhiteRect.setAttribute('x', '0');
    fullWhiteRect.setAttribute('y', '0');
    fullWhiteRect.setAttribute('width', '100%');
    fullWhiteRect.setAttribute('height', '100%');
    fullWhiteRect.setAttribute('fill', 'white');

    // Black cutout rectangle (transparent hole in mask)
    this.cutoutRectEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.cutoutRectEl.setAttribute('x', '0');
    this.cutoutRectEl.setAttribute('y', '0');
    this.cutoutRectEl.setAttribute('width', '0');
    this.cutoutRectEl.setAttribute('height', '0');
    this.cutoutRectEl.setAttribute('rx', '8');
    this.cutoutRectEl.setAttribute('ry', '8');
    this.cutoutRectEl.setAttribute('fill', 'black');
    this.cutoutRectEl.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    mask.appendChild(fullWhiteRect);
    mask.appendChild(this.cutoutRectEl);
    defs.appendChild(mask);
    maskSvg.appendChild(defs);

    // Dimmed backdrop rect applying the mask
    const backdropRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    backdropRect.setAttribute('x', '0');
    backdropRect.setAttribute('y', '0');
    backdropRect.setAttribute('width', '100%');
    backdropRect.setAttribute('height', '100%');
    backdropRect.setAttribute('fill', 'rgba(15, 23, 42, 0.65)'); // Slate 900 dim
    backdropRect.setAttribute('mask', 'url(#onboardflow-spotlight-mask)');
    backdropRect.style.transition = 'fill 0.3s ease';

    backdropRect.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.currentTour?.allowBackdropClick) {
        this.callbacks.onSkip();
      }
    });

    maskSvg.appendChild(backdropRect);
    this.backdropRectEl = backdropRect;
    this.svgMaskEl = maskSvg;
    this.containerEl.appendChild(maskSvg);

    // Tooltip Element
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.id = 'onboardflow-tooltip';
    this.tooltipEl.style.cssText = `
      position: absolute;
      width: 320px;
      max-width: calc(100vw - 32px);
      background: #ffffff;
      color: #0f172a;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05);
      padding: 18px 20px;
      pointer-events: auto;
      z-index: 1000000;
      opacity: 0;
      transform: scale(0.95);
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, top 0.25s cubic-bezier(0.4, 0, 0.2, 1), left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.2s ease;
    `;
    this.containerEl.appendChild(this.tooltipEl);

    document.body.appendChild(this.containerEl);

    // Keyboard handlers
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (this.currentTour?.isDismissable) {
          this.callbacks.onSkip();
        }
      } else if (e.key === 'ArrowRight') {
        this.callbacks.onNext();
      } else if (e.key === 'ArrowLeft') {
        this.callbacks.onPrev();
      }
    };
    window.addEventListener('keydown', this.keydownHandler);

    // Window resize & scroll positioning update
    window.addEventListener('resize', this.updatePosition);
    window.addEventListener('scroll', this.updatePosition, { passive: true });
  }

  public renderStep(tour: TourData, step: TourStepData, locale: string) {
    this.mount();
    this.currentTour = tour;
    this.currentStep = step;
    this.currentLocale = locale;

    if (!this.tooltipEl || !this.cutoutRectEl) return;

    const targetEl = findTargetElement(step.targetSelector);
    if (targetEl) {
      scrollElementIntoView(targetEl);
    }

    const totalSteps = tour.steps.length;
    const currentStepIndex = step.stepIndex;
    const isFirst = currentStepIndex <= 1;
    const isLast = currentStepIndex >= totalSteps;

    const i18n = resolveStepI18n(step.i18n, locale, tour.defaultLocale);
    const primaryColor = tour.themeConfig?.primaryColor || '#2563eb';
    const borderRadius = tour.themeConfig?.borderRadius || '12px';
    const cardStyle = tour.themeConfig?.cardStyle || 'clean';
    const normPlacement = (step.placement || 'bottom').toLowerCase();

    // Dynamic Backdrop Dim
    const dimOpacity = typeof step.backdropConfig?.dimOpacity === 'number'
      ? step.backdropConfig.dimOpacity
      : (tour.themeConfig?.backdropOpacity ?? 0.65);
    if (this.backdropRectEl) {
      this.backdropRectEl.setAttribute('fill', `rgba(15, 23, 42, ${dimOpacity})`);
      this.backdropRectEl.style.display = dimOpacity === 0 ? 'none' : 'block';
    }

    // Dynamic Card Style & Sharpness
    this.tooltipEl.style.borderRadius = borderRadius;
    let isDark = false;
    if (cardStyle === 'dark') {
      isDark = true;
      this.tooltipEl.style.background = '#0f172a';
      this.tooltipEl.style.color = '#f8fafc';
      this.tooltipEl.style.border = '1px solid #334155';
      this.tooltipEl.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.7)';
      this.tooltipEl.style.backdropFilter = 'none';
    } else if (cardStyle === 'glass') {
      this.tooltipEl.style.background = 'rgba(255, 255, 255, 0.88)';
      this.tooltipEl.style.color = '#0f172a';
      this.tooltipEl.style.border = '1px solid rgba(255, 255, 255, 0.6)';
      this.tooltipEl.style.boxShadow = '0 20px 30px -10px rgba(0, 0, 0, 0.15)';
      this.tooltipEl.style.backdropFilter = 'blur(16px)';
    } else if (cardStyle === 'elevated') {
      this.tooltipEl.style.background = '#ffffff';
      this.tooltipEl.style.color = '#0f172a';
      this.tooltipEl.style.border = `2px solid ${primaryColor}`;
      this.tooltipEl.style.boxShadow = `0 20px 25px -5px ${primaryColor}25, 0 8px 10px -6px rgba(0, 0, 0, 0.1)`;
      this.tooltipEl.style.backdropFilter = 'none';
    } else {
      // clean (default)
      this.tooltipEl.style.background = '#ffffff';
      this.tooltipEl.style.color = '#0f172a';
      this.tooltipEl.style.border = '1px solid #e2e8f0';
      this.tooltipEl.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
      this.tooltipEl.style.backdropFilter = 'none';
    }

    const titleColor = isDark ? '#ffffff' : '#0f172a';
    const bodyColor = isDark ? '#94a3b8' : '#475569';
    const prevBtnBg = isDark ? '#1e293b' : '#f1f5f9';
    const prevBtnColor = isDark ? '#cbd5e1' : '#475569';
    const prevBtnBorder = isDark ? '#334155' : '#e2e8f0';
    const btnRadius = Math.max(4, (parseInt(borderRadius) || 8) - 4);

    // Tooltip HTML content
    this.tooltipEl.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="display: inline-flex; align-items: center; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${primaryColor}; background: ${primaryColor}15; padding: 2px 8px; border-radius: 9999px;">
          ${currentStepIndex} / ${totalSteps}
        </span>
        ${
          tour.isDismissable
            ? `<button id="obf-close-btn" style="background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; border-radius: 4px; display: flex; align-items: center;" aria-label="Dismiss tour">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>`
            : ''
        }
      </div>
      <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600; color: ${titleColor}; line-height: 1.35;">
        ${escapeHtml(i18n.title)}
      </h3>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: ${bodyColor}; line-height: 1.5;">
        ${escapeHtml(i18n.content)}
      </p>
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <div>
          ${
            !isFirst
              ? `<button id="obf-prev-btn" style="background: ${prevBtnBg}; color: ${prevBtnColor}; border: 1px solid ${prevBtnBorder}; border-radius: ${btnRadius}px; padding: 6px 12px; font-size: 12px; font-weight: 500; cursor: pointer; transition: background 0.15s;">
                  ${escapeHtml(i18n.backBtn || 'Back')}
                </button>`
              : (tour.isDismissable
                  ? `<button id="obf-skip-btn" style="background: none; color: #64748b; border: none; font-size: 12px; font-weight: 500; cursor: pointer; padding: 6px 4px;">
                      ${escapeHtml(i18n.skipBtn || 'Skip')}
                    </button>`
                  : '')
          }
        </div>
        <button id="obf-next-btn" style="background: ${primaryColor}; color: #ffffff; border: none; border-radius: ${btnRadius}px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: opacity 0.15s;">
          ${escapeHtml(isLast ? (i18n.nextBtn || 'Finish') : (i18n.nextBtn || 'Next'))}
        </button>
      </div>
    `;

    // Hook buttons
    const nextBtn = this.tooltipEl.querySelector('#obf-next-btn');
    const prevBtn = this.tooltipEl.querySelector('#obf-prev-btn');
    const skipBtn = this.tooltipEl.querySelector('#obf-skip-btn');
    const closeBtn = this.tooltipEl.querySelector('#obf-close-btn');

    nextBtn?.addEventListener('click', () => this.callbacks.onNext());
    prevBtn?.addEventListener('click', () => this.callbacks.onPrev());
    skipBtn?.addEventListener('click', () => this.callbacks.onSkip());
    closeBtn?.addEventListener('click', () => this.callbacks.onSkip());

    // Trigger position update and make visible
    requestAnimationFrame(() => {
      this.updatePosition();
      if (this.tooltipEl) {
        this.tooltipEl.style.opacity = '1';
        this.tooltipEl.style.transform = 'scale(1)';
      }
    });
  }

  private updatePosition = () => {
    if (!this.tooltipEl || !this.currentStep || !this.cutoutRectEl) return;

    const rawPlacement = ((this.currentStep.backdropConfig as any)?.placement || this.currentStep.placement || 'bottom');
    const norm = rawPlacement.toLowerCase().replace('_', '-');

    // Adjust width for full bottom banner vs tooltip card
    if (norm === 'bottom-full' || norm === 'fullscreen') {
      this.tooltipEl.style.width = 'calc(100vw - 32px)';
      this.tooltipEl.style.maxWidth = '640px';
    } else {
      this.tooltipEl.style.width = '320px';
      this.tooltipEl.style.maxWidth = 'calc(100vw - 32px)';
    }

    const targetEl = findTargetElement(this.currentStep.targetSelector);
    const pos = calculatePosition(targetEl, this.tooltipEl, rawPlacement);

    this.tooltipEl.style.top = `${pos.tooltipTop}px`;
    this.tooltipEl.style.left = `${pos.tooltipLeft}px`;

    const borderRadius = this.currentTour?.themeConfig?.borderRadius || '12px';
    const rx = Math.min(16, parseInt(borderRadius) || 8);

    // Update Spotlight Cutout
    if (pos.targetRect && norm !== 'center') {
      const padding = 6;
      this.cutoutRectEl.setAttribute('x', `${Math.max(0, pos.targetRect.left - padding)}`);
      this.cutoutRectEl.setAttribute('y', `${Math.max(0, pos.targetRect.top - padding)}`);
      this.cutoutRectEl.setAttribute('width', `${pos.targetRect.width + padding * 2}`);
      this.cutoutRectEl.setAttribute('height', `${pos.targetRect.height + padding * 2}`);
      this.cutoutRectEl.setAttribute('rx', `${rx}`);
      this.cutoutRectEl.setAttribute('ry', `${rx}`);
    } else {
      // Center placement or no target: collapse spotlight cutout
      this.cutoutRectEl.setAttribute('x', '0');
      this.cutoutRectEl.setAttribute('y', '0');
      this.cutoutRectEl.setAttribute('width', '0');
      this.cutoutRectEl.setAttribute('height', '0');
    }
  };

  public unmount() {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    window.removeEventListener('resize', this.updatePosition);
    window.removeEventListener('scroll', this.updatePosition);

    if (this.containerEl && this.containerEl.parentNode) {
      this.containerEl.parentNode.removeChild(this.containerEl);
    }
    this.containerEl = null;
    this.tooltipEl = null;
    this.svgMaskEl = null;
    this.cutoutRectEl = null;
    this.currentStep = null;
    this.currentTour = null;
  }
}

function escapeHtml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
