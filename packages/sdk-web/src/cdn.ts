import { OnboardFlow } from './index';

declare global {
  interface Window {
    OnboardFlow: typeof OnboardFlow;
    onboardFlowInstance?: OnboardFlow;
  }
}

if (typeof window !== 'undefined') {
  window.OnboardFlow = OnboardFlow;

  // Auto-initialize if data-api-key attribute exists on the script tag
  const currentScript =
    document.currentScript ||
    document.querySelector('script[data-api-key]');

  if (currentScript) {
    const apiKey = currentScript.getAttribute('data-api-key');
    const apiUrl = currentScript.getAttribute('data-api-url') || undefined;
    const locale = currentScript.getAttribute('data-locale') || undefined;
    const autoStart = currentScript.getAttribute('data-auto-start') !== 'false';

    if (apiKey) {
      window.addEventListener('DOMContentLoaded', () => {
        window.onboardFlowInstance = OnboardFlow.init({
          apiKey,
          apiUrl,
          locale,
          autoStart,
        });
      });
    }
  }
}

export default OnboardFlow;
