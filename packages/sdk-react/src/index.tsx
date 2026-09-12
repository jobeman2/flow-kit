import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { OnboardFlow, TourData, TourStepData, OnboardFlowConfig } from '@onboardflow/web';

export * from '@onboardflow/web';

interface OnboardingContextValue {
  sdk: OnboardFlow | null;
  startTour: (slug: string) => boolean;
  nextStep: () => void;
  prevStep: () => void;
  dismissTour: () => void;
  setLocale: (locale: string) => void;
  locale: string;
  isReady: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export interface OnboardingProviderProps extends OnboardFlowConfig {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
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
  const [sdk, setSdk] = useState<OnboardFlow | null>(null);
  const [currentLocale, setCurrentLocale] = useState<string>(locale);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !apiKey) return;

    const instance = OnboardFlow.init({
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

  const value = useMemo<OnboardingContextValue>(() => {
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

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export function useTour(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useTour must be used within an <OnboardingProvider>');
  }
  return context;
}

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
  const { startTour } = useTour();

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
