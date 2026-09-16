import { StepPlacement } from './types';

export interface PositionResult {
  tooltipTop: number;
  tooltipLeft: number;
  arrowPlacement: StepPlacement;
  targetRect: DOMRect | null;
}

const MARGIN = 14; // margin between target and tooltip
const PADDING = 12; // margin from viewport boundary

export function findTargetElement(selector: string): HTMLElement | null {
  if (!selector || selector === 'body' || selector === 'window') return null;
  try {
    return document.querySelector<HTMLElement>(selector);
  } catch (e) {
    console.warn(`[OnboardFlow] Invalid selector: ${selector}`, e);
    return null;
  }
}

export function scrollElementIntoView(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const isInViewport =
    rect.top >= 50 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - 50 &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth);

  if (!isInViewport) {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }
}

export function calculatePosition(
  targetEl: HTMLElement | null,
  tooltipEl: HTMLElement,
  requestedPlacement: string = 'bottom'
): PositionResult {
  const vpWidth = window.innerWidth;
  const vpHeight = window.innerHeight;
  const tooltipRect = tooltipEl.getBoundingClientRect();
  const norm = (requestedPlacement || 'bottom').toLowerCase().replace('_', '-');

  // Bottom-full banner placement (full-width docked at bottom)
  if (norm === 'bottom-full' || norm === 'fullscreen') {
    const left = Math.max(PADDING, (vpWidth - tooltipRect.width) / 2);
    const top = Math.max(PADDING, vpHeight - tooltipRect.height - 20);
    return {
      tooltipTop: top,
      tooltipLeft: left,
      arrowPlacement: 'bottom' as StepPlacement,
      targetRect: targetEl ? targetEl.getBoundingClientRect() : null,
    };
  }

  // Screen-level placement when no target element is present
  if (!targetEl || norm === 'center') {
    let top = (vpHeight - tooltipRect.height) / 2;
    let left = (vpWidth - tooltipRect.width) / 2;

    if (norm === 'top') {
      top = PADDING + 20;
      left = (vpWidth - tooltipRect.width) / 2;
    } else if (norm === 'top-left') {
      top = PADDING + 20;
      left = PADDING + 20;
    } else if (norm === 'top-right') {
      top = PADDING + 20;
      left = vpWidth - tooltipRect.width - PADDING - 20;
    } else if (norm === 'bottom') {
      top = vpHeight - tooltipRect.height - PADDING - 20;
      left = (vpWidth - tooltipRect.width) / 2;
    } else if (norm === 'bottom-left') {
      top = vpHeight - tooltipRect.height - PADDING - 20;
      left = PADDING + 20;
    } else if (norm === 'bottom-right') {
      top = vpHeight - tooltipRect.height - PADDING - 20;
      left = vpWidth - tooltipRect.width - PADDING - 20;
    } else if (norm === 'left') {
      top = (vpHeight - tooltipRect.height) / 2;
      left = PADDING + 20;
    } else if (norm === 'right') {
      top = (vpHeight - tooltipRect.height) / 2;
      left = vpWidth - tooltipRect.width - PADDING - 20;
    }

    return {
      tooltipTop: Math.max(PADDING, Math.min(top, vpHeight - tooltipRect.height - PADDING)),
      tooltipLeft: Math.max(PADDING, Math.min(left, vpWidth - tooltipRect.width - PADDING)),
      arrowPlacement: 'center' as StepPlacement,
      targetRect: null,
    };
  }

  // Target element exists: compute relative placement
  const targetRect = targetEl.getBoundingClientRect();
  let placement = norm;

  // Collision detection & auto-flipping for vertical positions
  if (placement.startsWith('bottom') && targetRect.bottom + MARGIN + tooltipRect.height > vpHeight - PADDING) {
    if (targetRect.top - MARGIN - tooltipRect.height > PADDING) {
      placement = placement.replace('bottom', 'top');
    }
  } else if (placement.startsWith('top') && targetRect.top - MARGIN - tooltipRect.height < PADDING) {
    if (targetRect.bottom + MARGIN + tooltipRect.height <= vpHeight - PADDING) {
      placement = placement.replace('top', 'bottom');
    }
  }

  // Auto-flipping for horizontal positions
  if (placement === 'right' && targetRect.right + MARGIN + tooltipRect.width > vpWidth - PADDING) {
    if (targetRect.left - MARGIN - tooltipRect.width > PADDING) {
      placement = 'left';
    }
  } else if (placement === 'left' && targetRect.left - MARGIN - tooltipRect.width < PADDING) {
    if (targetRect.right + MARGIN + tooltipRect.width <= vpWidth - PADDING) {
      placement = 'right';
    }
  }

  let top = 0;
  let left = 0;

  switch (placement) {
    case 'top':
      top = targetRect.top - tooltipRect.height - MARGIN;
      left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      break;
    case 'top-left':
      top = targetRect.top - tooltipRect.height - MARGIN;
      left = targetRect.left;
      break;
    case 'top-right':
      top = targetRect.top - tooltipRect.height - MARGIN;
      left = targetRect.right - tooltipRect.width;
      break;
    case 'bottom':
      top = targetRect.bottom + MARGIN;
      left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      break;
    case 'bottom-left':
      top = targetRect.bottom + MARGIN;
      left = targetRect.left;
      break;
    case 'bottom-right':
      top = targetRect.bottom + MARGIN;
      left = targetRect.right - tooltipRect.width;
      break;
    case 'left':
      top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
      left = targetRect.left - tooltipRect.width - MARGIN;
      break;
    case 'right':
      top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
      left = targetRect.right + MARGIN;
      break;
    default:
      top = targetRect.bottom + MARGIN;
      left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      break;
  }

  // Clamp within viewport margins
  left = Math.max(PADDING, Math.min(left, vpWidth - tooltipRect.width - PADDING));
  top = Math.max(PADDING, Math.min(top, vpHeight - tooltipRect.height - PADDING));

  return {
    tooltipTop: top,
    tooltipLeft: left,
    arrowPlacement: placement as StepPlacement,
    targetRect,
  };
}
