import { StepI18n } from './types';

const DEFAULT_LABELS: Record<string, StepI18n> = {
  en: {
    title: 'Tour Guide',
    content: '',
    nextBtn: 'Next',
    backBtn: 'Back',
    skipBtn: 'Skip',
  },
  am: {
    title: 'የመረጃ መመሪያ',
    content: '',
    nextBtn: 'ቀጣይ',
    backBtn: 'ተመለስ',
    skipBtn: 'ዝለል',
  },
  om: {
    title: 'Qajeelfama Daawwannaa',
    content: '',
    nextBtn: 'Itti Aana',
    backBtn: 'Duubatti',
    skipBtn: 'Darbii',
  },
  fr: {
    title: 'Guide Visite',
    content: '',
    nextBtn: 'Suivant',
    backBtn: 'Retour',
    skipBtn: 'Passer',
  },
  ar: {
    title: 'دليل الجولة',
    content: '',
    nextBtn: 'التالي',
    backBtn: 'السابق',
    skipBtn: 'تخطي',
  },
};

export function normalizeLocale(locale?: string): string {
  if (!locale) {
    if (typeof navigator !== 'undefined' && navigator.language) {
      locale = navigator.language;
    } else {
      return 'en';
    }
  }
  // Convert "am-ET" -> "am", "en-US" -> "en"
  return locale.toLowerCase().split('-')[0];
}

export function resolveStepI18n(
  i18nRecord: Record<string, StepI18n>,
  activeLocale: string,
  defaultLocale: string = 'en'
): StepI18n {
  const normActive = normalizeLocale(activeLocale);
  const normDefault = normalizeLocale(defaultLocale);

  const activeContent = i18nRecord[normActive] || i18nRecord[normDefault] || Object.values(i18nRecord)[0] || {};
  const defaultBase = DEFAULT_LABELS[normActive] || DEFAULT_LABELS[normDefault] || DEFAULT_LABELS.en;

  return {
    title: activeContent.title || defaultBase.title,
    content: activeContent.content || '',
    nextBtn: activeContent.nextBtn || defaultBase.nextBtn,
    backBtn: activeContent.backBtn || defaultBase.backBtn,
    skipBtn: activeContent.skipBtn || defaultBase.skipBtn,
  };
}
