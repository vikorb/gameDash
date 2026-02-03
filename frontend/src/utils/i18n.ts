import { i18n, type SupportedLocale } from '@/plugins/i18n';

export function setLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale;
  localStorage.setItem('locale', locale);
}

export function getLocale(): SupportedLocale {
  const current = i18n.global.locale.value;
  return current === 'fr' || current === 'en' ? current : 'en';
}
