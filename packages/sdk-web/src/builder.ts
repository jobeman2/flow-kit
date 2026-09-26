export interface BuilderConfig {
  apiKey: string;
  apiUrl?: string;
  activeTourId?: string;
  isAdmin?: boolean;
  onTourUpdated?: (tour: any) => void;
}

interface ScannedStep {
  targetSelector: string;
  placement: string;
  title: string;
  content: string;
  element: HTMLElement;
  selected: boolean;
}

export class LiveBuilder {
  private static instance: LiveBuilder | null = null;
  private config: BuilderConfig & { apiUrl: string };
  private isActive: boolean = false;
  private isPicking: boolean = false;
  private isMinimized: boolean = false;
  private rootEl: HTMLElement | null = null;
  private highlightEl: HTMLElement | null = null;
  private labelEl: HTMLElement | null = null;
  private popupEl: HTMLElement | null = null;
  private autoScanModalEl: HTMLElement | null = null;
  private currentSelectedEl: HTMLElement | null = null;
  private currentSelector: string = '';
  private currentPlacement: string = 'BOTTOM';
  private tours: any[] = [];
  private selectedTourId: string = '';

  constructor(config: BuilderConfig) {
    this.config = {
      ...config,
      apiUrl: config.apiUrl || 'http://localhost:4000',
      isAdmin: config.isAdmin ?? false,
    };
    this.selectedTourId = config.activeTourId || '';
  }

  public static getInstance(config?: BuilderConfig): LiveBuilder {
    if (!LiveBuilder.instance && config) {
      LiveBuilder.instance = new LiveBuilder(config);
    } else if (LiveBuilder.instance && config) {
      if (config.isAdmin !== undefined) {
        LiveBuilder.instance.config.isAdmin = config.isAdmin;
      }
      if (config.activeTourId) {
        LiveBuilder.instance.selectedTourId = config.activeTourId;
      }
    }
    return LiveBuilder.instance!;
  }

  public setAdmin(isAdmin: boolean) {
    this.config.isAdmin = isAdmin;
    if (!isAdmin) {
      this.stop();
    } else if (!this.isActive) {
      this.start();
    }
  }

  public async start() {
    // Only administrators are permitted to start/view the visual builder dock
    if (!this.config.isAdmin) {
      return;
    }

    if (this.isActive) return;
    this.isActive = true;

    await this.loadTours();
    this.injectStyles();
    this.createFloatingDock();
    this.createHighlightOverlay();
    this.attachEventListeners();
  }

  public stop() {
    this.isActive = false;
    this.isPicking = false;
    if (this.rootEl) {
      this.rootEl.remove();
      this.rootEl = null;
    }
    if (this.highlightEl) {
      this.highlightEl.remove();
      this.highlightEl = null;
    }
    if (this.labelEl) {
      this.labelEl.remove();
      this.labelEl = null;
    }
    if (this.popupEl) {
      this.popupEl.remove();
      this.popupEl = null;
    }
    if (this.autoScanModalEl) {
      this.autoScanModalEl.remove();
      this.autoScanModalEl = null;
    }
  }

  private async loadTours() {
    try {
      const res = await fetch(`${this.config.apiUrl}/v1/public/builder/tours`, {
        headers: { 'x-api-key': this.config.apiKey },
      });
      if (res.ok) {
        this.tours = await res.json();
        if (!this.selectedTourId && this.tours.length > 0) {
          this.selectedTourId = this.tours[0].id;
        }
      }
    } catch (e) {
      console.warn('[Flow-Kit Builder] Failed to load tours:', e);
    }
  }

  private injectStyles() {
    if (document.getElementById('flowkit-builder-styles')) return;
    const style = document.createElement('style');
    style.id = 'flowkit-builder-styles';
    style.innerHTML = `
      #flowkit-builder-root {
        all: initial;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-sizing: border-box;
      }
      #flowkit-builder-root * {
        box-sizing: border-box;
      }
      .fk-builder-dock {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2147483640;
        background: rgba(15, 23, 42, 0.94);
        backdrop-filter: blur(12px);
        color: #ffffff;
        padding: 8px 16px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.15);
        font-size: 13px;
        font-weight: 500;
        user-select: none;
        transition: all 0.2s ease;
      }
      .fk-builder-badge {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483640;
        background: #0f172a;
        color: #38bdf8;
        padding: 8px 14px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.15);
      }
      .fk-builder-badge:hover {
        background: #1e293b;
      }
      .fk-builder-btn {
        background: #2563eb;
        color: #fff;
        border: none;
        padding: 6px 12px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease;
        white-space: nowrap;
      }
      .fk-builder-btn:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
      }
      .fk-builder-btn.auto-scan {
        background: linear-gradient(135deg, #8b5cf6, #d946ef);
        box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
      }
      .fk-builder-btn.auto-scan:hover {
        background: linear-gradient(135deg, #7c3aed, #c026d3);
      }
      .fk-builder-btn.picking {
        background: #ef4444;
        animation: fk-pulse 1.5s infinite;
      }
      .fk-builder-btn.secondary {
        background: rgba(255,255,255,0.12);
        color: #f1f5f9;
      }
      .fk-builder-btn.secondary:hover {
        background: rgba(255,255,255,0.22);
      }
      .fk-builder-select {
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        color: #ffffff;
        padding: 5px 10px;
        border-radius: 8px;
        font-size: 12px;
        outline: none;
        cursor: pointer;
        max-width: 180px;
      }
      .fk-builder-select option {
        background: #0f172a;
        color: #ffffff;
      }
      @keyframes fk-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      .fk-step-popup {
        position: fixed;
        z-index: 2147483645;
        background: #ffffff;
        color: #0f172a;
        width: 320px;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08);
        font-size: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .fk-popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 700;
        font-size: 13px;
        border-bottom: 1px solid #f1f5f9;
        padding-bottom: 8px;
      }
      .fk-input, .fk-textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 12px;
        outline: none;
        transition: border 0.15s ease;
      }
      .fk-input:focus, .fk-textarea:focus {
        border-color: #2563eb;
      }
      .fk-grid-placement {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
      }
      .fk-place-btn {
        padding: 4px;
        font-size: 10px;
        font-weight: 600;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        background: #f8fafc;
        cursor: pointer;
        text-align: center;
      }
      .fk-place-btn.active {
        background: #0f172a;
        color: #ffffff;
        border-color: #0f172a;
      }

      /* Auto Scan Modal */
      .fk-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        z-index: 2147483646;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .fk-modal-card {
        background: #ffffff;
        color: #0f172a;
        width: 100%;
        max-width: 540px;
        max-height: 85vh;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .fk-modal-header {
        padding: 16px 20px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .fk-modal-body {
        padding: 16px 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .fk-scanned-card {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px;
        background: #f8fafc;
        display: flex;
        gap: 12px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .fk-scanned-card:hover {
        border-color: #3b82f6;
        background: #f0f7ff;
      }
      .fk-modal-footer {
        padding: 14px 20px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        background: #f8fafc;
      }
    `;
    document.head.appendChild(style);
  }

  private createFloatingDock() {
    this.rootEl = document.createElement('div');
    this.rootEl.id = 'flowkit-builder-root';

    if (this.isMinimized) {
      this.renderMinimizedBadge();
    } else {
      this.renderFullDock();
    }

    document.body.appendChild(this.rootEl);
  }

  private renderMinimizedBadge() {
    if (!this.rootEl) return;
    this.rootEl.innerHTML = '';

    const badge = document.createElement('div');
    badge.className = 'fk-builder-badge';
    badge.title = 'Click to open Flow-Kit Admin Builder';
    badge.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polygon points="12 2 19 21 12 17 5 21 12 2"/>
      </svg>
      <span>Flow-Kit Admin</span>
    `;
    badge.addEventListener('click', () => {
      this.isMinimized = false;
      this.renderFullDock();
    });
    this.rootEl.appendChild(badge);
  }

  private renderFullDock() {
    if (!this.rootEl) return;
    this.rootEl.innerHTML = '';

    const dock = document.createElement('div');
    dock.className = 'fk-builder-dock';

    const logo = document.createElement('div');
    logo.style.cssText = 'display:flex;align-items:center;gap:6px;font-weight:700;color:#38bdf8;cursor:default;';
    logo.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polygon points="12 2 19 21 12 17 5 21 12 2"/>
      </svg>
      <span>Flow-Kit</span>
      <span style="font-size:10px;padding:2px 6px;border-radius:4px;background:rgba(56,189,248,0.2);color:#38bdf8;font-weight:600;">Admin</span>
    `;
    dock.appendChild(logo);

    // Tour Select
    const tourSelect = document.createElement('select');
    tourSelect.className = 'fk-builder-select';
    this.tours.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.title} (${t.steps?.length || 0} steps)`;
      if (t.id === this.selectedTourId) opt.selected = true;
      tourSelect.appendChild(opt);
    });
    tourSelect.addEventListener('change', () => {
      this.selectedTourId = tourSelect.value;
    });
    dock.appendChild(tourSelect);

    // ⚡ Auto-Scan Page Button
    const autoScanBtn = document.createElement('button');
    autoScanBtn.className = 'fk-builder-btn auto-scan';
    autoScanBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      <span>Auto-Scan Page</span>
    `;
    autoScanBtn.title = 'Automatically scan key elements on this page and build a multi-step tour in 1 click';
    autoScanBtn.addEventListener('click', () => {
      this.autoScanPage();
    });
    dock.appendChild(autoScanBtn);

    // 🎯 Pick Element Button
    const pickBtn = document.createElement('button');
    pickBtn.className = 'fk-builder-btn';
    pickBtn.id = 'fk-pick-btn';
    pickBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 3l7 18 3-7 7-3L3 3z"/>
      </svg>
      <span>Pick Element</span>
    `;
    pickBtn.addEventListener('click', () => {
      this.togglePickMode(!this.isPicking);
    });
    dock.appendChild(pickBtn);

    // Preview Tour Button
    const previewBtn = document.createElement('button');
    previewBtn.className = 'fk-builder-btn secondary';
    previewBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
      <span>Preview</span>
    `;
    previewBtn.addEventListener('click', () => {
      const activeTour = this.tours.find((t) => t.id === this.selectedTourId);
      if (activeTour && (window as any).flowKitInstance) {
        (window as any).flowKitInstance.startTour(activeTour.slug);
      }
    });
    dock.appendChild(previewBtn);

    // Minimize button
    const minBtn = document.createElement('button');
    minBtn.className = 'fk-builder-btn secondary';
    minBtn.style.padding = '6px 8px';
    minBtn.title = 'Minimize';
    minBtn.textContent = '–';
    minBtn.addEventListener('click', () => {
      this.isMinimized = true;
      this.renderMinimizedBadge();
    });
    dock.appendChild(minBtn);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'fk-builder-btn secondary';
    closeBtn.style.padding = '6px 8px';
    closeBtn.textContent = '✕';
    closeBtn.title = 'Close Builder';
    closeBtn.addEventListener('click', () => this.stop());
    dock.appendChild(closeBtn);

    this.rootEl.appendChild(dock);
  }

  private createHighlightOverlay() {
    this.highlightEl = document.createElement('div');
    this.highlightEl.style.cssText =
      'position:fixed;pointer-events:none;z-index:2147483642;border:2px solid #2563eb;background:rgba(37,99,235,0.15);box-shadow:0 0 0 4px rgba(37,99,235,0.25);border-radius:4px;transition:all 0.05s ease;display:none;';

    this.labelEl = document.createElement('div');
    this.labelEl.style.cssText =
      'position:fixed;pointer-events:none;z-index:2147483643;background:#0f172a;color:#ffffff;font-size:11px;font-weight:600;font-family:monospace;padding:3px 8px;border-radius:4px;box-shadow:0 4px 6px rgba(0,0,0,0.2);display:none;white-space:nowrap;';

    document.body.appendChild(this.highlightEl);
    document.body.appendChild(this.labelEl);
  }

  private togglePickMode(enable: boolean) {
    this.isPicking = enable;
    const pickBtn = document.getElementById('fk-pick-btn');
    if (pickBtn) {
      if (enable) {
        pickBtn.classList.add('picking');
        pickBtn.innerHTML = '<span>Click Any Element</span>';
      } else {
        pickBtn.classList.remove('picking');
        pickBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3l7 18 3-7 7-3L3 3z"/>
          </svg>
          <span>Pick Element</span>
        `;
        if (this.highlightEl) this.highlightEl.style.display = 'none';
        if (this.labelEl) this.labelEl.style.display = 'none';
      }
    }
  }

  private attachEventListeners() {
    document.addEventListener('mousemove', this.onMouseMove, true);
    document.addEventListener('click', this.onClick, true);
  }

  private isBuilderElement(el: HTMLElement): boolean {
    return (
      !!el.closest('#flowkit-builder-root') ||
      el === this.highlightEl ||
      el === this.labelEl ||
      el === this.popupEl ||
      !!el.closest('.fk-step-popup') ||
      !!el.closest('.fk-modal-backdrop')
    );
  }

  private getOptimalSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    for (const attr of ['data-tour', 'data-testid', 'data-id', 'name']) {
      const val = el.getAttribute(attr);
      if (val) return `[${attr}="${val}"]`;
    }
    const role = el.getAttribute('role');
    if (role) return `[role="${role}"]`;

    // Semantic tag with class
    const tag = el.tagName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
      const primaryClass = el.className
        .trim()
        .split(/\s+/)
        .filter((c) => !c.includes(':') && c.length < 24 && !c.startsWith('hover') && !c.startsWith('focus'))[0];
      if (primaryClass) return `${tag}.${primaryClass}`;
    }

    if (tag === 'h1' || tag === 'h2' || tag === 'input' || tag === 'header' || tag === 'nav' || tag === 'aside') {
      return tag;
    }

    return tag;
  }

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isPicking) return;
    const target = e.target as HTMLElement;
    if (!target || this.isBuilderElement(target)) return;

    const r = target.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;

    if (this.highlightEl) {
      this.highlightEl.style.display = 'block';
      this.highlightEl.style.top = `${r.top}px`;
      this.highlightEl.style.left = `${r.left}px`;
      this.highlightEl.style.width = `${r.width}px`;
      this.highlightEl.style.height = `${r.height}px`;
    }

    const sel = this.getOptimalSelector(target);
    if (this.labelEl) {
      this.labelEl.style.display = 'block';
      this.labelEl.style.top = `${Math.max(6, r.top - 26)}px`;
      this.labelEl.style.left = `${Math.max(6, r.left)}px`;
      this.labelEl.textContent = `🎯 ${sel}`;
    }
  };

  private onClick = (e: MouseEvent) => {
    if (!this.isPicking) return;
    const target = e.target as HTMLElement;
    if (!target || this.isBuilderElement(target)) return;

    e.preventDefault();
    e.stopPropagation();

    this.currentSelectedEl = target;
    this.currentSelector = this.getOptimalSelector(target);
    this.togglePickMode(false);
    this.showStepCreationPopup(target);
  };

  /**
   * ⚡ 1-Click Page Auto-Scan
   * Inspects current DOM, identifies key landmarks (Hero/Heading, Navigation, Search, Data Grid),
   * and renders a review modal to batch-save all steps in 1 click.
   */
  public autoScanPage() {
    if (!this.selectedTourId) {
      alert('Please select or create a tour first.');
      return;
    }

    const scanned: ScannedStep[] = [];
    const usedSelectors = new Set<string>();

    const addCandidate = (
      el: HTMLElement | null,
      defaultTitle: string,
      defaultContent: string,
      defaultPlacement: string,
    ) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 25 || rect.height < 15 || rect.bottom < 0 || rect.top > window.innerHeight * 2) {
        return;
      }
      const sel = this.getOptimalSelector(el);
      if (usedSelectors.has(sel)) return;
      usedSelectors.add(sel);

      scanned.push({
        targetSelector: sel,
        placement: defaultPlacement,
        title: defaultTitle,
        content: defaultContent,
        element: el,
        selected: true,
      });
    };

    // 1. Page Header / Main Title
    const heading = (document.querySelector('main h1') ||
      document.querySelector('h1') ||
      document.querySelector('h2')) as HTMLElement;
    if (heading) {
      const headingText = heading.textContent?.trim().replace(/\s+/g, ' ').slice(0, 35);
      addCandidate(
        heading,
        headingText ? `Welcome to ${headingText}` : 'Page Overview',
        'Here is your primary workspace. Get a complete summary of your activity and track your progress in real time.',
        'BOTTOM',
      );
    }

    // 2. Navigation / Sidebar Menu
    const nav = (document.querySelector('aside') ||
      document.querySelector('nav') ||
      document.querySelector('[role="navigation"]')) as HTMLElement;
    if (nav) {
      const isLeft = nav.getBoundingClientRect().left < window.innerWidth / 3;
      addCandidate(
        nav,
        'Navigation Menu',
        'Use this menu to seamlessly move between your properties, active inspections, reports, and team settings.',
        isLeft ? 'RIGHT' : 'BOTTOM',
      );
    }

    // 3. Search / Filters
    const search = (document.querySelector('input[type="search"]') ||
      document.querySelector('input[placeholder*="search" i]') ||
      document.querySelector('input[placeholder*="filter" i]')) as HTMLElement;
    if (search) {
      addCandidate(
        search,
        'Instant Search & Filter',
        'Find any record, property, or inspection report instantly by typing keywords or filtering by status.',
        'BOTTOM',
      );
    }

    // 4. Main Stats / Cards / Data Grid
    const gridItem = (document.querySelector('.grid > div') ||
      document.querySelector('table') ||
      document.querySelector('[data-tour="metrics"]') ||
      document.querySelector('section > div')) as HTMLElement;
    if (gridItem) {
      addCandidate(
        gridItem,
        'Key Metrics & Activity',
        'Monitor performance, outstanding tasks, and live status updates directly from these interactive cards.',
        'TOP',
      );
    }

    if (scanned.length === 0) {
      alert('Could not find enough distinct page landmarks on this page. Try picking elements manually!');
      return;
    }

    this.showAutoScanModal(scanned);
  }

  private showAutoScanModal(scanned: ScannedStep[]) {
    if (this.autoScanModalEl) this.autoScanModalEl.remove();

    const backdrop = document.createElement('div');
    backdrop.className = 'fk-modal-backdrop';

    const card = document.createElement('div');
    card.className = 'fk-modal-card';

    card.innerHTML = `
      <div class="fk-modal-header">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:18px;">⚡</span>
          <div>
            <h3 style="margin:0;font-size:15px;font-weight:700;">Page Auto-Scan</h3>
            <p style="margin:0;font-size:12px;color:#64748b;">Detected ${scanned.length} key landmarks on this page. Review and save in 1 click!</p>
          </div>
        </div>
        <button id="fk-modal-close" style="background:none;border:none;cursor:pointer;font-size:16px;color:#64748b;">✕</button>
      </div>
      <div class="fk-modal-body" id="fk-scan-list">
        ${scanned
          .map(
            (step, idx) => `
          <div class="fk-scanned-card" data-idx="${idx}">
            <input type="checkbox" id="fk-check-${idx}" checked style="margin-top:4px;cursor:pointer;" />
            <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;">Step ${idx + 1}: ${step.placement}</span>
                <code style="font-size:11px;background:#e2e8f0;padding:2px 6px;border-radius:4px;">${step.targetSelector}</code>
              </div>
              <input type="text" class="fk-input" id="fk-scan-title-${idx}" value="${step.title}" />
              <textarea class="fk-textarea" id="fk-scan-content-${idx}" rows="2">${step.content}</textarea>
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
      <div class="fk-modal-footer">
        <button class="fk-builder-btn secondary" id="fk-cancel-scan">Cancel</button>
        <button class="fk-builder-btn auto-scan" id="fk-save-scanned">
          ✨ Save ${scanned.length} Steps to Tour
        </button>
      </div>
    `;

    backdrop.appendChild(card);
    document.body.appendChild(backdrop);
    this.autoScanModalEl = backdrop;

    // Hover card to highlight element on page
    scanned.forEach((step, idx) => {
      const cardEl = card.querySelector(`[data-idx="${idx}"]`);
      cardEl?.addEventListener('mouseenter', () => {
        const r = step.element.getBoundingClientRect();
        if (this.highlightEl) {
          this.highlightEl.style.display = 'block';
          this.highlightEl.style.top = `${r.top}px`;
          this.highlightEl.style.left = `${r.left}px`;
          this.highlightEl.style.width = `${r.width}px`;
          this.highlightEl.style.height = `${r.height}px`;
        }
      });
      cardEl?.addEventListener('mouseleave', () => {
        if (this.highlightEl) this.highlightEl.style.display = 'none';
      });
    });

    // Close handlers
    card.querySelector('#fk-modal-close')?.addEventListener('click', () => {
      backdrop.remove();
      this.autoScanModalEl = null;
      if (this.highlightEl) this.highlightEl.style.display = 'none';
    });
    card.querySelector('#fk-cancel-scan')?.addEventListener('click', () => {
      backdrop.remove();
      this.autoScanModalEl = null;
      if (this.highlightEl) this.highlightEl.style.display = 'none';
    });

    // Save batch
    card.querySelector('#fk-save-scanned')?.addEventListener('click', async () => {
      const saveBtn = card.querySelector('#fk-save-scanned') as HTMLButtonElement;
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving Steps...';

      const stepsToSave = scanned
        .map((step, idx) => {
          const checked = (card.querySelector(`#fk-check-${idx}`) as HTMLInputElement)?.checked;
          const title = (card.querySelector(`#fk-scan-title-${idx}`) as HTMLInputElement)?.value.trim();
          const content = (card.querySelector(`#fk-scan-content-${idx}`) as HTMLTextAreaElement)?.value.trim();
          return {
            targetSelector: step.targetSelector,
            placement: step.placement,
            title: title || step.title,
            content: content || step.content,
            selected: checked,
          };
        })
        .filter((s) => s.selected);

      if (stepsToSave.length === 0) {
        alert('Please select at least one step to save.');
        saveBtn.disabled = false;
        saveBtn.textContent = '✨ Save Steps to Tour';
        return;
      }

      try {
        const res = await fetch(`${this.config.apiUrl}/v1/public/builder/add-steps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
          },
          body: JSON.stringify({
            tourId: this.selectedTourId,
            steps: stepsToSave,
          }),
        });

        if (!res.ok) throw new Error('Failed to save scanned steps');

        const updatedTour = await res.json();
        saveBtn.textContent = `✓ ${stepsToSave.length} Steps Saved!`;
        saveBtn.style.background = '#10b981';

        setTimeout(() => {
          backdrop.remove();
          this.autoScanModalEl = null;
          if (this.highlightEl) this.highlightEl.style.display = 'none';
          this.loadTours().then(() => this.renderFullDock());
          if (this.config.onTourUpdated) this.config.onTourUpdated(updatedTour);
        }, 800);
      } catch (err: any) {
        alert(err.message || 'Error saving steps');
        saveBtn.disabled = false;
        saveBtn.textContent = '✨ Save Steps to Tour';
      }
    });
  }

  private showStepCreationPopup(target: HTMLElement) {
    if (this.popupEl) this.popupEl.remove();

    const r = target.getBoundingClientRect();
    this.popupEl = document.createElement('div');
    this.popupEl.className = 'fk-step-popup';

    // Position popup next to target
    let top = r.bottom + 12;
    let left = Math.min(window.innerWidth - 340, Math.max(16, r.left));
    if (top + 300 > window.innerHeight) {
      top = Math.max(16, r.top - 320);
    }
    this.popupEl.style.top = `${top}px`;
    this.popupEl.style.left = `${left}px`;

    // Guess title from element text
    const textPreview = (target.textContent || '').trim().replace(/\s+/g, ' ').substring(0, 30);
    const defaultTitle = textPreview ? textPreview : `Guide: ${this.currentSelector}`;

    this.popupEl.innerHTML = `
      <div class="fk-popup-header">
        <span>✨ Add Walkthrough Step</span>
        <button id="fk-close-popup" style="background:none;border:none;cursor:pointer;font-size:14px;">✕</button>
      </div>
      <div>
        <label style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;">Target Selector</label>
        <input type="text" class="fk-input" id="fk-input-sel" value="${this.currentSelector}" />
      </div>
      <div>
        <label style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;">Step Title</label>
        <input type="text" class="fk-input" id="fk-input-title" value="${defaultTitle}" placeholder="e.g. Instant Search" />
      </div>
      <div>
        <label style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;">Explanation Content</label>
        <textarea class="fk-textarea" id="fk-input-content" rows="3" placeholder="Tell inspectors what this feature does..."></textarea>
      </div>
      <div>
        <label style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px;display:block;">Card Placement</label>
        <div class="fk-grid-placement">
          <button class="fk-place-btn" data-place="TOP-LEFT">Top Left</button>
          <button class="fk-place-btn" data-place="TOP">Top</button>
          <button class="fk-place-btn" data-place="TOP-RIGHT">Top Right</button>
          <button class="fk-place-btn" data-place="LEFT">Left</button>
          <button class="fk-place-btn" data-place="CENTER">Center</button>
          <button class="fk-place-btn" data-place="RIGHT">Right</button>
          <button class="fk-place-btn" data-place="BOTTOM-LEFT">Bottom Left</button>
          <button class="fk-place-btn active" data-place="BOTTOM">Bottom</button>
          <button class="fk-place-btn" data-place="BOTTOM-RIGHT">Bottom Right</button>
        </div>
      </div>
      <button class="fk-builder-btn" id="fk-save-step" style="width:100%;justify-content:center;padding:8px 0;margin-top:6px;">
        Save Step to Tour
      </button>
    `;

    document.body.appendChild(this.popupEl);

    // Event handlers for popup
    document.getElementById('fk-close-popup')?.addEventListener('click', () => {
      this.popupEl?.remove();
      this.popupEl = null;
    });

    const placeButtons = this.popupEl.querySelectorAll('.fk-place-btn');
    placeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        placeButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentPlacement = (btn as HTMLElement).dataset.place || 'BOTTOM';
      });
    });

    document.getElementById('fk-save-step')?.addEventListener('click', async () => {
      const selInput = document.getElementById('fk-input-sel') as HTMLInputElement;
      const titleInput = document.getElementById('fk-input-title') as HTMLInputElement;
      const contentInput = document.getElementById('fk-input-content') as HTMLTextAreaElement;

      const saveBtn = document.getElementById('fk-save-step') as HTMLButtonElement;
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving Step...';

      try {
        const res = await fetch(`${this.config.apiUrl}/v1/public/builder/add-step`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
          },
          body: JSON.stringify({
            tourId: this.selectedTourId,
            step: {
              targetSelector: selInput.value.trim() || this.currentSelector,
              placement: this.currentPlacement,
              title: titleInput.value.trim() || 'New Step',
              content: contentInput.value.trim() || '',
            },
          }),
        });

        if (!res.ok) throw new Error('Failed to save step');

        const updatedTour = await res.json();
        saveBtn.textContent = '✓ Step Saved!';
        saveBtn.style.background = '#10b981';

        setTimeout(() => {
          this.popupEl?.remove();
          this.popupEl = null;
          // Reload local tours
          this.loadTours().then(() => this.renderFullDock());
          if (this.config.onTourUpdated) this.config.onTourUpdated(updatedTour);
        }, 600);
      } catch (err: any) {
        alert(err.message || 'Error saving step');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Step to Tour';
      }
    });
  }
}
