export interface SdkChecklistItem {
  id: string;
  title: string;
  duration?: string;
  action: () => void;
}

export interface ChecklistWidgetOptions {
  title?: string;
  items: SdkChecklistItem[];
  storageKey?: string;
}

export class ChecklistWidgetManager {
  private containerEl: HTMLElement | null = null;
  private options: ChecklistWidgetOptions;
  private completedIds: Set<string> = new Set();
  private isOpen: boolean = false;

  constructor(options: ChecklistWidgetOptions) {
    this.options = {
      title: 'Getting Started',
      storageKey: 'fk_checklist_progress',
      ...options,
    };
    this.loadProgress();
  }

  private loadProgress() {
    try {
      const saved = localStorage.getItem(this.options.storageKey || 'fk_checklist_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.completedIds = new Set(parsed);
        }
      }
    } catch {}
  }

  private saveProgress() {
    try {
      localStorage.setItem(
        this.options.storageKey || 'fk_checklist_progress',
        JSON.stringify(Array.from(this.completedIds))
      );
    } catch {}
  }

  public mount() {
    if (this.containerEl || typeof document === 'undefined') return;

    this.containerEl = document.createElement('div');
    this.containerEl.id = 'fk-checklist-root';
    this.containerEl.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999990;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    document.body.appendChild(this.containerEl);
    this.render();
  }

  public markCompleted(id: string) {
    this.completedIds.add(id);
    this.saveProgress();
    this.render();
  }

  public toggleOpen() {
    this.isOpen = !this.isOpen;
    this.render();
  }

  private render() {
    if (!this.containerEl) return;

    const total = this.options.items.length;
    const completedCount = this.options.items.filter((item) => this.completedIds.has(item.id)).length;
    const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    this.containerEl.innerHTML = `
      ${
        this.isOpen
          ? `
        <div style="margin-bottom: 12px; width: 330px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); overflow: hidden;">
          <div style="padding: 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 700; font-size: 13px; color: #0b1b34;">${this.options.title}</div>
              <div style="font-size: 11px; color: #64748b; font-family: monospace;">${completedCount} of ${total} completed (${percent}%)</div>
            </div>
            <button id="fk-checklist-close" style="border: none; background: none; font-size: 16px; cursor: pointer; color: #94a3b8;">✕</button>
          </div>
          <div style="height: 4px; background: #e2e8f0;">
            <div style="height: 100%; width: ${percent}%; background: #0b1b34; transition: width 0.3s ease;"></div>
          </div>
          <div id="fk-checklist-items" style="padding: 8px; max-height: 260px; overflow-y: auto;"></div>
        </div>
      `
          : ''
      }
      <button id="fk-checklist-trigger" style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #0b1b34; color: #ffffff; border: 1px solid #1e293b; border-radius: 9999px; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 9999px; background: #00D4B2;"></span>
        <span>Get Started (${completedCount}/${total})</span>
      </button>
    `;

    this.containerEl.querySelector('#fk-checklist-trigger')?.addEventListener('click', () => {
      this.toggleOpen();
    });

    if (this.isOpen) {
      this.containerEl.querySelector('#fk-checklist-close')?.addEventListener('click', () => {
        this.toggleOpen();
      });

      const listEl = this.containerEl.querySelector('#fk-checklist-items');
      if (listEl) {
        this.options.items.forEach((item, index) => {
          const done = this.completedIds.has(item.id);
          const itemEl = document.createElement('div');
          itemEl.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 10px;
            border-radius: 6px;
            margin-bottom: 4px;
            cursor: pointer;
            background: ${done ? '#f8fafc' : '#ffffff'};
            border: 1px solid ${done ? '#f1f5f9' : 'transparent'};
          `;

          itemEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: ${
                done ? '#10b981' : '#f1f5f9'
              }; color: ${done ? '#ffffff' : '#64748b'};">
                ${done ? '✓' : index + 1}
              </span>
              <span style="font-size: 12px; color: ${done ? '#94a3b8' : '#1e293b'}; text-decoration: ${
            done ? 'line-through' : 'none'
          };">
                ${item.title}
              </span>
            </div>
            <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">${item.duration || ''}</span>
          `;

          itemEl.addEventListener('click', () => {
            this.markCompleted(item.id);
            item.action();
          });

          listEl.appendChild(itemEl);
        });
      }
    }
  }

  public destroy() {
    this.containerEl?.remove();
    this.containerEl = null;
  }
}
