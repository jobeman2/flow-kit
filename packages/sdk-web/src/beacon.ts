export interface BeaconOptions {
  selector: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  badge?: string;
}

export class HotspotBeaconManager {
  private beacons: Map<string, HTMLElement> = new Map();

  public attachBeacon(options: BeaconOptions): () => void {
    if (typeof document === 'undefined') return () => {};

    const targetEl = document.querySelector(options.selector);
    if (!targetEl) return () => {};

    const id = `fk-beacon-${Math.random().toString(36).substring(2, 9)}`;

    // Create beacon wrapper
    const wrapper = document.createElement('div');
    wrapper.id = id;
    wrapper.style.cssText = `
      position: absolute;
      top: -6px;
      right: -6px;
      z-index: 99999;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      cursor: pointer;
    `;

    // Ping animation
    const ping = document.createElement('span');
    ping.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 9999px;
      background: #00D4B2;
      opacity: 0.75;
      animation: fk-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    `;

    // Dot
    const dot = document.createElement('span');
    dot.style.cssText = `
      position: relative;
      width: 10px;
      height: 10px;
      border-radius: 9999px;
      background: #00D4B2;
      border: 2px solid #ffffff;
      box-shadow: 0 1px 2px rgba(0,0,0,0.15);
    `;

    wrapper.appendChild(ping);
    wrapper.appendChild(dot);

    // Inject ping animation CSS keyframes if not present
    if (!document.getElementById('fk-beacon-keyframes')) {
      const style = document.createElement('style');
      style.id = 'fk-beacon-keyframes';
      style.textContent = `
        @keyframes fk-ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Make target position relative if static
    const targetPos = window.getComputedStyle(targetEl).position;
    if (targetPos === 'static') {
      (targetEl as HTMLElement).style.position = 'relative';
    }

    targetEl.appendChild(wrapper);
    this.beacons.set(id, wrapper);

    // Popover
    let popover: HTMLElement | null = null;

    wrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      if (popover) {
        popover.remove();
        popover = null;
        return;
      }

      popover = document.createElement('div');
      popover.style.cssText = `
        position: absolute;
        top: 24px;
        right: 0;
        width: 260px;
        background: #ffffff;
        color: #0f172a;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px 14px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        z-index: 100000;
      `;

      popover.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; background: #ecfeff; color: #0891b2; padding: 2px 6px; border-radius: 4px; border: 1px solid #cffafe;">
            ${options.badge || 'New'}
          </span>
          <button id="${id}-close" style="border: none; background: none; font-size: 14px; cursor: pointer; color: #94a3b8; line-height: 1;">×</button>
        </div>
        <div style="font-weight: 700; color: #0b1b34; margin-bottom: 4px;">${options.title}</div>
        <div style="color: #64748b; font-size: 11px; line-height: 1.4; margin-bottom: 8px;">${options.description}</div>
        ${
          options.actionText
            ? `<button id="${id}-action" style="background: #0b1b34; color: #ffffff; border: none; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">${options.actionText}</button>`
            : ''
        }
      `;

      wrapper.appendChild(popover);

      popover.querySelector(`#${id}-close`)?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        popover?.remove();
        popover = null;
      });

      if (options.onAction) {
        popover.querySelector(`#${id}-action`)?.addEventListener('click', (ev) => {
          ev.stopPropagation();
          popover?.remove();
          popover = null;
          options.onAction?.();
        });
      }
    });

    return () => {
      wrapper.remove();
      this.beacons.delete(id);
    };
  }

  public removeAll() {
    this.beacons.forEach((el) => el.remove());
    this.beacons.clear();
  }
}
