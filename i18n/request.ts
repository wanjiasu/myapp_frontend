import {getRequestConfig} from 'next-intl/server';
import {locales} from '../i18n';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as any)) {
    console.warn(`Invalid or missing locale: ${locale}, using default 'en'`);
    locale = 'en';
  }

  return {
    locale: locale as string,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});