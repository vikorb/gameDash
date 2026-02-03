import { createI18n } from 'vue-i18n';
import { deepMerge } from '@/utils/deepMerge';

export const SUPPORT_LOCALES = ['fr', 'en'] as const;
export type SupportedLocale = typeof SUPPORT_LOCALES[number];

type MessageSchema = Record<string, unknown>;

function getDefaultLocale(): SupportedLocale {
  const saved = localStorage.getItem('locale');
  if (saved === 'fr' || saved === 'en') return saved;

  const browser = navigator.language.toLowerCase();
  return browser.startsWith('fr') ? 'fr' : 'en';
}

const localeModules = import.meta.glob<{ default: MessageSchema }>(
  '../locales/**/**/*.json',
  { eager: true }
);

function loadLocaleMessages(locale: SupportedLocale): MessageSchema {
  const merged: MessageSchema = {};

  for (const [path, mod] of Object.entries(localeModules)) {
    if (path.includes(`/locales/${locale}/`)) {
      deepMerge(merged, mod.default);
    }
  }

  return merged;
}

const messages: Record<SupportedLocale, MessageSchema> = {
  fr: loadLocaleMessages('fr'),
  en: loadLocaleMessages('en'),
};

export const i18n = createI18n<[MessageSchema], SupportedLocale>({
  legacy: false,
  globalInjection: true,
  locale: getDefaultLocale(),
  fallbackLocale: 'en',
  messages,
});
