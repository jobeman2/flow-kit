import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { FlowKit, FlowKitConfig, TourData, TourStepData } from '@flow-kit/web';

export * from '@flow-kit/web';

export interface FlowKitContextValue {
  sdk: FlowKit | null;
  startTour: (slug: string) => boolean;
  nextStep: () => void;
  prevStep: () => void;
  dismissTour: () => void;
  setLocale: (locale: string) => void;
  locale: string;
  isReady: boolean;
}

export type OnboardingContextValue = FlowKitContextValue;

const FlowKitContext = createContext<FlowKitContextValue | null>(null);

export interface FlowKitProviderProps extends FlowKitConfig {
  children: ReactNode;
}

export type OnboardingProviderProps = FlowKitProviderProps;

export const FlowKitProvider: React.FC<FlowKitProviderProps> = ({
  children,
  apiKey,
  apiUrl,
  locale = 'en',
  autoStart = true,
  onTourStart,
  onStepChange,
  onTourComplete,
  onTourDismiss,
}) => {
  const [sdk, setSdk] = useState<FlowKit | null>(null);
  const [currentLocale, setCurrentLocale] = useState<string>(locale);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !apiKey) return;

    const instance = FlowKit.init({
      apiKey,
      apiUrl,
      locale: currentLocale,
      autoStart,
      onTourStart,
      onStepChange,
      onTourComplete,
      onTourDismiss,
    });

    setSdk(instance);
    setIsReady(true);
  }, [apiKey, apiUrl]);

  const value = useMemo<FlowKitContextValue>(() => {
    return {
      sdk,
      isReady,
      locale: currentLocale,
      startTour: (slug: string) => sdk?.startTour(slug) ?? false,
      nextStep: () => sdk?.nextStep(),
      prevStep: () => sdk?.prevStep(),
      dismissTour: () => sdk?.dismissTour(),
      setLocale: (newLocale: string) => {
        setCurrentLocale(newLocale);
        sdk?.setLocale(newLocale);
      },
    };
  }, [sdk, isReady, currentLocale]);

  return <FlowKitContext.Provider value={value}>{children}</FlowKitContext.Provider>;
};

export const OnboardingProvider = FlowKitProvider;

export function useFlowKit(): FlowKitContextValue {
  const context = useContext(FlowKitContext);
  if (!context) {
    throw new Error('useFlowKit must be used within a <FlowKitProvider>');
  }
  return context;
}

export const useTour = useFlowKit;

export interface TourTriggerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tourSlug: string;
  children?: ReactNode;
}

export const TourTriggerButton: React.FC<TourTriggerButtonProps> = ({
  tourSlug,
  children = 'Take Interactive Tour',
  onClick,
  ...props
}) => {
  const { startTour } = useFlowKit();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    startTour(tourSlug);
    if (onClick) onClick(e);
  };

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
};
