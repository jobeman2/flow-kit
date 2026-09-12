export type StepPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

export type StepAction = 'NONE' | 'CLICK_TARGET' | 'INPUT_VALUE';

export interface StepI18n {
  title: string;
  content: string;
  nextBtn?: string;
  backBtn?: string;
  skipBtn?: string;
}

export interface TourStepData {
  id: string;
  stepIndex: number;
  targetSelector: string;
  placement: StepPlacement;
  i18n: Record<string, StepI18n>; // e.g. { en: {...}, am: {...}, om: {...} }
  requiredAction?: StepAction;
  backdropConfig?: {
    dimOpacity?: number;
    blur?: number;
    clickThrough?: boolean;
  };
  advanceOnSelectorClick?: boolean;
}

export interface TourData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  triggerType: 'AUTO_FIRST_VISIT' | 'URL_MATCH' | 'ELEMENT_CLICK' | 'PROGRAMMATIC';
  targetUrlPattern: string;
  defaultLocale: string;
  isDismissable: boolean;
  allowBackdropClick: boolean;
  themeConfig?: {
    primaryColor?: string;
    borderRadius?: string;
    backdropOpacity?: number;
    zIndex?: number;
  };
  steps: TourStepData[];
}

export interface OnboardFlowConfig {
  apiKey: string;
  apiUrl?: string;
  locale?: string;
  autoStart?: boolean;
  onTourStart?: (tour: TourData) => void;
  onStepChange?: (step: TourStepData, index: number) => void;
  onTourComplete?: (tour: TourData) => void;
  onTourDismiss?: (tour: TourData) => void;
}

export type TelemetryEventType =
  | 'TOUR_STARTED'
  | 'STEP_VIEWED'
  | 'STEP_COMPLETED'
  | 'TOUR_SKIPPED'
  | 'TOUR_COMPLETED';

export interface TelemetryPayload {
  projectId?: string;
  tourId: string;
  tourStepId?: string;
  eventType: TelemetryEventType;
  anonymousUserId: string;
  locale: string;
  path: string;
  userMetadata?: Record<string, any>;
  clientTimestamp: string;
}
