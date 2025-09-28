import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // Always use locale prefix to avoid confusion
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … if they start with `/studio` (Sanity Studio)
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|studio|.*\\..*).*)'
  ]
};