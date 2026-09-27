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
  private isDropdownOpen: boolean = false;
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
    if (!this.config.isAdmin) return;
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
    this.isDropdownOpen = false;
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
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-sizing: border-box;
      }
      #flowkit-builder-root * {
        box-sizing: border-box;
        font-family: inherit;
      }

      /* Floating Dock */
      .fk-builder-dock {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2147483640;
        height: 48px;
        background: #0f172a;
        color: #ffffff;
        padding: 0 10px 0 14px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.12);
        font-size: 13px;
        font-weight: 500;
        user-select: none;
        white-space: nowrap;
        flex-wrap: nowrap;
      }

      .fk-builder-badge {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483640;
        height: 38px;
        background: #0f172a;
        color: #ffffff;
        padding: 0 14px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        box-shadow: 0 10px 20px -3px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15);
        transition: all 0.15s ease;
      }
      .fk-builder-badge:hover {
        background: #1e293b;
        transform: translateY(-1px);
      }

      .fk-dock-divider {
        width: 1px;
        height: 18px;
        background: rgba(255, 255, 255, 0.14);
        margin: 0 2px;
      }

      /* Custom Tour Selector Trigger */
      .fk-tour-trigger {
        height: 32px;
        padding: 0 10px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 8px;
        color: #ffffff;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.15s ease;
      }
      .fk-tour-trigger:hover {
        background: rgba(255, 255, 255, 0.14);
        border-color: rgba(255, 255, 255, 0.22);
      }
      .fk-tour-count {
        background: rgba(255, 255, 255, 0.14);
        color: #94a3b8;
        font-size: 10px;
        font-weight: 600;
        padding: 1px 6px;
        border-radius: 9999px;
      }

      /* Tour Dropdown Menu */
      .fk-tour-menu {
        position: absolute;
        bottom: 56px;
        left: 120px;
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);
        min-width: 240px;
        max-height: 260px;
        overflow-y: auto;
        padding: 6px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        z-index: 2147483648;
      }
      .fk-tour-item {
        padding: 8px 10px;
        border-radius: 8px;
        color: #ffffff;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        transition: background 0.1s ease;
      }
      .fk-tour-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      .fk-tour-item.selected {
        background: rgba(255, 255, 255, 0.14);
        font-weight: 600;
      }

      /* Dock Buttons */
      .fk-dock-btn {
        height: 32px;
        padding: 0 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease;
        border: none;
      }
      .fk-dock-btn.primary {
        background: #ffffff;
        color: #0f172a;
        font-weight: 600;
      }
      .fk-dock-btn.primary:hover {
        background: #f1f5f9;
        transform: translateY(-1px);
      }
      .fk-dock-btn.secondary {
        background: rgba(255, 255, 255, 0.08);
        color: #f8fafc;
        border: 1px solid rgba(255, 255, 255, 0.14);
      }
      .fk-dock-btn.secondary:hover {
        background: rgba(255, 255, 255, 0.15);
      }
      .fk-dock-btn.picking {
        background: #ef4444;
        border-color: #ef4444;
        color: #ffffff;
      }
      .fk-dock-btn.ghost {
        background: transparent;
        color: #94a3b8;
        padding: 0 8px;
      }
      .fk-dock-btn.ghost:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.08);
      }
      .fk-icon-btn {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        background: transparent;
        border: none;
        color: #94a3b8;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .fk-icon-btn:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
      }

      /* Step Popup Modal (Design matched to Murn) */
      .fk-step-popup {
        position: fixed;
        z-index: 2147483645;
        background: #ffffff;
        color: #0f172a;
        width: 360px;
        border-radius: 14px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .fk-popup-header {
        padding: 14px 18px;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .fk-popup-title {
        font-size: 14px;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }
      .fk-popup-body {
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .fk-field-label {
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        margin-bottom: 4px;
        display: block;
      }
      .fk-input, .fk-textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 13px;
        outline: none;
        color: #0f172a;
        background: #ffffff;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .fk-input:focus, .fk-textarea:focus {
        border-color: #0f172a;
        box-shadow: 0 0 0 1px #0f172a;
      }
      .fk-input.mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 11px;
        background: #f8fafc;
      }
      .fk-grid-placement {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
      }
      .fk-place-btn {
        padding: 6px 0;
        font-size: 11px;
        font-weight: 500;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background: #f8fafc;
        color: #475569;
        cursor: pointer;
        text-align: center;
        transition: all 0.1s ease;
      }
      .fk-place-btn:hover {
        background: #f1f5f9;
      }
      .fk-place-btn.active {
        background: #0f172a;
        color: #ffffff;
        border-color: #0f172a;
        font-weight: 600;
      }
      .fk-popup-footer {
        padding: 12px 18px 16px;
        display: flex;
        gap: 8px;
      }
      .fk-btn-murn-primary {
        flex: 2;
        height: 36px;
        background: #0f172a;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: background 0.15s ease;
      }
      .fk-btn-murn-primary:hover {
        background: #1e293b;
      }
      .fk-btn-murn-secondary {
        flex: 1;
        height: 36px;
        background: #ffffff;
        color: #475569;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
      }
      .fk-btn-murn-secondary:hover {
        background: #f8fafc;
        color: #0f172a;
      }

      /* Auto-Scan Review Modal (Design matched to Murn) */
      .fk-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
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
        max-width: 560px;
        max-height: 85vh;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .fk-modal-header {
        padding: 18px 22px 14px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .fk-modal-body {
        padding: 16px 22px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .fk-scanned-card {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px 14px;
        background: #f8fafc;
        display: flex;
        gap: 12px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .fk-scanned-card:hover {
        border-color: #0f172a;
        background: #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      }
      .fk-modal-footer {
        padding: 14px 22px;
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
    badge.title = 'Open Flow-Kit Admin Builder';
    badge.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

    // Logo & Brand
    const logo = document.createElement('div');
    logo.style.cssText = 'display:flex;align-items:center;gap:6px;font-weight:600;color:#ffffff;cursor:default;';
    logo.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <polygon points="12 2 19 21 12 17 5 21 12 2"/>
      </svg>
      <span>Flow-Kit</span>
      <span style="font-size:10px;padding:2px 5px;border-radius:4px;background:rgba(255,255,255,0.12);color:#94a3b8;font-weight:600;letter-spacing:0.5px;">ADMIN</span>
    `;
    dock.appendChild(logo);

    // Divider
    const div1 = document.createElement('div');
    div1.className = 'fk-dock-divider';
    dock.appendChild(div1);

    // Custom Tour Selector Dropdown
    const selectedTour = this.tours.find((t) => t.id === this.selectedTourId) || this.tours[0];
    const trigger = document.createElement('button');
    trigger.className = 'fk-tour-trigger';
    trigger.id = 'fk-tour-trigger';
    trigger.innerHTML = `
      <span id="fk-tour-label">${selectedTour ? selectedTour.title : 'Select Tour'}</span>
      <span class="fk-tour-count" id="fk-tour-count">${selectedTour ? selectedTour.steps?.length || 0 : 0} steps</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    `;
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleTourDropdown();
    });
    dock.appendChild(trigger);

    // Auto-Scan Page Button (Crisp primary action)
    const autoScanBtn = document.createElement('button');
    autoScanBtn.className = 'fk-dock-btn primary';
    autoScanBtn.title = 'Scan page landmarks and auto-generate tour steps in 1 click';
    autoScanBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M8.757 15.243l-2.121 2.121m0-12.728l2.121 2.121m8.486 8.486l2.121 2.121"/>
      </svg>
      <span>Auto-Scan</span>
    `;
    autoScanBtn.addEventListener('click', () => {
      this.autoScanPage();
    });
    dock.appendChild(autoScanBtn);

    // Pick Element Button
    const pickBtn = document.createElement('button');
    pickBtn.className = 'fk-dock-btn secondary';
    pickBtn.id = 'fk-pick-btn';
    pickBtn.title = 'Click any element on the page to attach a walkthrough step';
    pickBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="22" y1="12" x2="18" y2="12"/>
        <line x1="6" y1="12" x2="2" y2="12"/>
        <line x1="12" y1="6" x2="12" y2="2"/>
        <line x1="12" y1="22" x2="12" y2="18"/>
      </svg>
      <span>Pick Element</span>
    `;
    pickBtn.addEventListener('click', () => {
      this.togglePickMode(!this.isPicking);
    });
    dock.appendChild(pickBtn);

    // Preview Tour Button
    const previewBtn = document.createElement('button');
    previewBtn.className = 'fk-dock-btn ghost';
    previewBtn.title = 'Play tour on this page';
    previewBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
      <span>Preview</span>
    `;
    previewBtn.addEventListener('click', () => {
      const activeTour = this.tours.find((t) => t.id === this.selectedTourId);
      if (activeTour && (window as any).flowKitInstance) {
        (window as any).flowKitInstance.startTour(activeTour.slug, activeTour);
      }
    });
    dock.appendChild(previewBtn);

    // Divider
    const div2 = document.createElement('div');
    div2.className = 'fk-dock-divider';
    dock.appendChild(div2);

    // Minimize Button
    const minBtn = document.createElement('button');
    minBtn.className = 'fk-icon-btn';
    minBtn.title = 'Minimize';
    minBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    `;
    minBtn.addEventListener('click', () => {
      this.isMinimized = true;
      this.renderMinimizedBadge();
    });
    dock.appendChild(minBtn);

    // Close Button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'fk-icon-btn';
    closeBtn.title = 'Close Builder';
    closeBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;
    closeBtn.addEventListener('click', () => this.stop());
    dock.appendChild(closeBtn);

    this.rootEl.appendChild(dock);
  }

  private toggleTourDropdown() {
    const existingMenu = this.rootEl?.querySelector('.fk-tour-menu');
    if (existingMenu) {
      existingMenu.remove();
      this.isDropdownOpen = false;
      return;
    }

    if (!this.rootEl) return;
    this.isDropdownOpen = true;

    const menu = document.createElement('div');
    menu.className = 'fk-tour-menu';

    this.tours.forEach((tour) => {
      const isSelected = tour.id === this.selectedTourId;
      const item = document.createElement('div');
      item.className = `fk-tour-item ${isSelected ? 'selected' : ''}`;
      item.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;overflow:hidden;">
          ${isSelected ? `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ` : `
            <span style="width:13px;"></span>
          `}
          <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">${tour.title}</span>
        </div>
        <span class="fk-tour-count">${tour.steps?.length || 0} steps</span>
      `;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedTourId = tour.id;
        menu.remove();
        this.isDropdownOpen = false;
        this.renderFullDock();
      });

      menu.appendChild(item);
    });

    this.rootEl.appendChild(menu);

    // Close when clicking outside
    const onDocClick = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove();
        this.isDropdownOpen = false;
        document.removeEventListener('click', onDocClick);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', onDocClick);
    }, 10);
  }

  private createHighlightOverlay() {
    this.highlightEl = document.createElement('div');
    this.highlightEl.style.cssText =
      'position:fixed;pointer-events:none;z-index:2147483642;border:2px solid #0f172a;background:rgba(15,23,42,0.08);box-shadow:0 0 0 3px rgba(15,23,42,0.15);border-radius:6px;transition:all 0.05s ease;display:none;';

    this.labelEl = document.createElement('div');
    this.labelEl.style.cssText =
      'position:fixed;pointer-events:none;z-index:2147483643;background:#0f172a;color:#ffffff;font-size:11px;font-weight:600;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;padding:3px 8px;border-radius:4px;box-shadow:0 4px 6px rgba(0,0,0,0.15);display:none;white-space:nowrap;';

    document.body.appendChild(this.highlightEl);
    document.body.appendChild(this.labelEl);
  }

  private togglePickMode(enable: boolean) {
    this.isPicking = enable;
    const pickBtn = document.getElementById('fk-pick-btn');
    if (pickBtn) {
      if (enable) {
        pickBtn.classList.add('picking');
        pickBtn.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <span>Cancel Pick</span>
        `;
      } else {
        pickBtn.classList.remove('picking');
        pickBtn.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="22" y1="12" x2="18" y2="12"/>
            <line x1="6" y1="12" x2="2" y2="12"/>
            <line x1="12" y1="6" x2="12" y2="2"/>
            <line x1="12" y1="22" x2="12" y2="18"/>
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

  private resolvePickingTarget(raw: HTMLElement): HTMLElement {
    let el: HTMLElement = raw;
    // If it's an SVG element or inside an SVG (e.g. rect, path, circle), bubble up to enclosing HTML container
    if (el instanceof SVGElement || el.tagName.toLowerCase() === 'svg' || el.closest('svg')) {
      const svg = el.closest('svg');
      if (svg && svg.parentElement && !this.isBuilderElement(svg.parentElement)) {
        el = svg.parentElement;
      }
    }
    // If it's a small inline text/icon inside a button, bubble up to the button
    const btn = el.closest('button');
    if (btn && !this.isBuilderElement(btn)) {
      return btn;
    }
    return el;
  }

  private getOptimalSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    for (const attr of ['data-tour', 'data-testid', 'data-id', 'name']) {
      const val = el.getAttribute(attr);
      if (val) return `[${attr}="${val}"]`;
    }
    const role = el.getAttribute('role');
    if (role && ['navigation', 'search', 'main', 'banner'].includes(role)) {
      return `[role="${role}"]`;
    }

    const tag = el.tagName.toLowerCase();

    // Specific input types
    if (tag === 'input') {
      const type = el.getAttribute('type');
      if (type === 'search') return 'input[type="search"]';
      const placeholder = el.getAttribute('placeholder');
      if (placeholder) {
        return `input[placeholder*="${placeholder.slice(0, 15)}"]`;
      }
      return 'input';
    }

    // Headings
    if (tag === 'h1') return 'h1';
    if (tag === 'h2') return 'h2';
    if (tag === 'nav') return 'nav';
    if (tag === 'aside') return 'aside';

    // Grid items (e.g. dashboard cards)
    if (el.parentElement) {
      const parentClass = el.parentElement.className;
      if (typeof parentClass === 'string' && parentClass.includes('grid')) {
        const index = Array.from(el.parentElement.children).indexOf(el) + 1;
        return `.grid > div:nth-child(${index})`;
      }
    }

    // Semantic tag with class
    if (el.className && typeof el.className === 'string') {
      const primaryClass = el.className
        .trim()
        .split(/\s+/)
        .filter((c) => !c.includes(':') && c.length < 24 && !c.startsWith('hover') && !c.startsWith('focus'))[0];
      if (primaryClass) return `${tag}.${primaryClass}`;
    }

    return tag;
  }

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isPicking) return;
    const raw = e.target as HTMLElement;
    if (!raw || this.isBuilderElement(raw)) return;

    const target = this.resolvePickingTarget(raw);
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
      this.labelEl.textContent = sel;
    }
  };

  private onClick = (e: MouseEvent) => {
    if (!this.isPicking) return;
    const raw = e.target as HTMLElement;
    if (!raw || this.isBuilderElement(raw)) return;

    e.preventDefault();
    e.stopPropagation();

    const target = this.resolvePickingTarget(raw);
    this.currentSelectedEl = target;
    this.currentSelector = this.getOptimalSelector(target);
    this.togglePickMode(false);
    this.showStepCreationPopup(target);
  };

  /**
   * 1-Click Page Auto-Scan
   */
  public autoScanPage() {
    if (!this.selectedTourId) {
      alert('Please select a tour first.');
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
      alert('Could not find enough distinct page landmarks on this page. Try picking elements manually.');
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
        <div>
          <h3 style="margin:0;font-size:16px;font-weight:700;color:#0f172a;">Page Auto-Scan</h3>
          <p style="margin:2px 0 0;font-size:13px;color:#64748b;">Detected ${scanned.length} key landmarks on this page. Review and add to tour.</p>
        </div>
        <button id="fk-modal-close" class="fk-icon-btn" style="color:#64748b;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="fk-modal-body" id="fk-scan-list">
        ${scanned
          .map(
            (step, idx) => `
          <div class="fk-scanned-card" data-idx="${idx}">
            <input type="checkbox" id="fk-check-${idx}" checked style="margin-top:4px;cursor:pointer;accent-color:#0f172a;" />
            <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:11px;font-weight:700;color:#0f172a;">Step ${idx + 1} &bull; ${step.placement}</span>
                <code style="font-size:11px;background:#e2e8f0;color:#334155;padding:2px 6px;border-radius:4px;font-family:monospace;">${step.targetSelector}</code>
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
        <button class="fk-btn-murn-secondary" id="fk-cancel-scan" style="flex:none;padding:0 16px;">Cancel</button>
        <button class="fk-btn-murn-primary" id="fk-save-scanned" style="flex:none;padding:0 20px;">
          Save ${scanned.length} Steps to Tour
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
        saveBtn.textContent = `Save ${scanned.length} Steps to Tour`;
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
        saveBtn.textContent = 'Steps Saved!';
        saveBtn.style.background = '#16a34a';

        if ((window as any).flowKitInstance) {
          (window as any).flowKitInstance.registerTour(updatedTour);
        }

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
        saveBtn.textContent = `Save ${scanned.length} Steps to Tour`;
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
    let left = Math.min(window.innerWidth - 380, Math.max(16, r.left));
    if (top + 340 > window.innerHeight) {
      top = Math.max(16, r.top - 360);
    }
    this.popupEl.style.top = `${top}px`;
    this.popupEl.style.left = `${left}px`;

    // Guess title from element text
    const textPreview = (target.textContent || '').trim().replace(/\s+/g, ' ').substring(0, 30);
    const defaultTitle = textPreview ? textPreview : `Guide: ${this.currentSelector}`;

    this.popupEl.innerHTML = `
      <div class="fk-popup-header">
        <h4 class="fk-popup-title">Add Step</h4>
        <button id="fk-close-popup" class="fk-icon-btn" style="color:#64748b;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="fk-popup-body">
        <div>
          <label class="fk-field-label">Target Selector</label>
          <input type="text" class="fk-input mono" id="fk-input-sel" value="${this.currentSelector}" />
        </div>
        <div>
          <label class="fk-field-label">Step Title</label>
          <input type="text" class="fk-input" id="fk-input-title" value="${defaultTitle}" placeholder="e.g. Instant Search" />
        </div>
        <div>
          <label class="fk-field-label">Description</label>
          <textarea class="fk-textarea" id="fk-input-content" rows="3" placeholder="Tell inspectors what this feature does..."></textarea>
        </div>
        <div>
          <label class="fk-field-label">Card Placement</label>
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
      </div>
      <div class="fk-popup-footer">
        <button class="fk-btn-murn-secondary" id="fk-popup-cancel">Cancel</button>
        <button class="fk-btn-murn-primary" id="fk-save-step">
          Save Step to Tour
        </button>
      </div>
    `;

    document.body.appendChild(this.popupEl);

    // Event handlers for popup
    document.getElementById('fk-close-popup')?.addEventListener('click', () => {
      this.popupEl?.remove();
      this.popupEl = null;
    });
    document.getElementById('fk-popup-cancel')?.addEventListener('click', () => {
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
        saveBtn.textContent = 'Step Saved!';
        saveBtn.style.background = '#16a34a';

        if ((window as any).flowKitInstance) {
          (window as any).flowKitInstance.registerTour(updatedTour);
        }

        setTimeout(() => {
          this.popupEl?.remove();
          this.popupEl = null;
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
