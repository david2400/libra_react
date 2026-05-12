import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
  
  // Ensure we have a valid locale
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
