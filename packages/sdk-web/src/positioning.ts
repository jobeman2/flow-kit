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
  requestedPlacement: StepPlacement = 'bottom'
): PositionResult {
  const vpWidth = window.innerWidth;
  const vpHeight = window.innerHeight;
  const tooltipRect = tooltipEl.getBoundingClientRect();

  // Center placement or no target element
  if (!targetEl || requestedPlacement === 'center') {
    const left = Math.max(PADDING, (vpWidth - tooltipRect.width) / 2);
    const top = Math.max(PADDING, (vpHeight - tooltipRect.height) / 2);
    return {
      tooltipTop: top,
      tooltipLeft: left,
      arrowPlacement: 'center',
      targetRect: targetEl ? targetEl.getBoundingClientRect() : null,
    };
  }

  const targetRect = targetEl.getBoundingClientRect();
  let placement = requestedPlacement;

  // Collision detection & auto-flipping
  if (placement === 'bottom' && targetRect.bottom + MARGIN + tooltipRect.height > vpHeight - PADDING) {
    if (targetRect.top - MARGIN - tooltipRect.height > PADDING) {
      placement = 'top';
    }
  } else if (placement === 'top' && targetRect.top - MARGIN - tooltipRect.height < PADDING) {
    if (targetRect.bottom + MARGIN + tooltipRect.height <= vpHeight - PADDING) {
      placement = 'bottom';
    }
  } else if (placement === 'right' && targetRect.right + MARGIN + tooltipRect.width > vpWidth - PADDING) {
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
    case 'bottom':
      top = targetRect.bottom + MARGIN;
      left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      break;
    case 'left':
      top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
      left = targetRect.left - tooltipRect.width - MARGIN;
      break;
    case 'right':
      top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
      left = targetRect.right + MARGIN;
      break;
  }

  // Clamp within viewport margins
  left = Math.max(PADDING, Math.min(left, vpWidth - tooltipRect.width - PADDING));
  top = Math.max(PADDING, Math.min(top, vpHeight - tooltipRect.height - PADDING));

  return {
    tooltipTop: top,
    tooltipLeft: left,
    arrowPlacement: placement,
    targetRect,
  };
}
