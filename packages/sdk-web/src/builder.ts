export interface BuilderConfig {
  apiKey: string;
  apiUrl?: string;
  activeTourId?: string;
  onTourUpdated?: (tour: any) => void;
}

export class LiveBuilder {
  private static instance: LiveBuilder | null = null;
  private config: BuilderConfig & { apiUrl: string };
  private isActive: boolean = false;
  private isPicking: boolean = false;
  private rootEl: HTMLElement | null = null;
  private highlightEl: HTMLElement | null = null;
  private labelEl: HTMLElement | null = null;
  private popupEl: HTMLElement | null = null;
  private currentSelectedEl: HTMLElement | null = null;
  private currentSelector: string = '';
  private currentPlacement: string = 'BOTTOM';
  private tours: any[] = [];
  private selectedTourId: string = '';

  constructor(config: BuilderConfig) {
    this.config = {
      ...config,
      apiUrl: config.apiUrl || 'http://localhost:4000',
    };
    this.selectedTourId = config.activeTourId || '';
  }

  public static getInstance(config?: BuilderConfig): LiveBuilder {
    if (!LiveBuilder.instance && config) {
      LiveBuilder.instance = new LiveBuilder(config);
    }
    return LiveBuilder.instance!;
  }

  public async start() {
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
        gap: 12px;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.15);
        font-size: 13px;
        font-weight: 500;
        user-select: none;
      }
      .fk-builder-btn {
        background: #2563eb;
        color: #fff;
        border: none;
        padding: 6px 14px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease;
      }
      .fk-builder-btn:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
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
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 12px;
        outline: none;
        cursor: pointer;
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
    `;
    document.head.appendChild(style);
  }

  private createFloatingDock() {
    this.rootEl = document.createElement('div');
    this.rootEl.id = 'flowkit-builder-root';

    const dock = document.createElement('div');
    dock.className = 'fk-builder-dock';

    const logo = document.createElement('div');
    logo.style.cssText = 'display:flex;align-items:center;gap:6px;font-weight:700;color:#38bdf8;';
    logo.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polygon points="12 2 19 21 12 17 5 21 12 2"/>
      </svg>
      <span>Flow-Kit Builder</span>
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

    // Pick Element Button
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
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'fk-builder-btn secondary';
    closeBtn.style.padding = '6px 10px';
    closeBtn.textContent = '✕';
    closeBtn.title = 'Close Builder';
    closeBtn.addEventListener('click', () => this.stop());
    dock.appendChild(closeBtn);

    this.rootEl.appendChild(dock);
    document.body.appendChild(this.rootEl);
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
    return !!el.closest('#flowkit-builder-root') || el === this.highlightEl || el === this.labelEl || el === this.popupEl || !!el.closest('.fk-step-popup');
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

    if (tag === 'h1' || tag === 'h2' || tag === 'input' || tag === 'header' || tag === 'nav') {
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
          this.loadTours();
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
