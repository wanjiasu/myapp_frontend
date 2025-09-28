"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '../i18n';
import { Globe } from 'lucide-react';
import { useState } from 'react';

const languageNames = {
  en: 'English',
  zh: '中文',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  es: 'Español',
  pt: 'Português',
  hi: 'हिन्दी',
  ko: '한국어'
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: string) => {
    // Get the current pathname and remove any locale prefix
    let pathWithoutLocale = pathname;
    
    // Remove any existing locale from the beginning of the path
    for (const loc of locales) {
      if (pathWithoutLocale.startsWith(`/${loc}`)) {
        pathWithoutLocale = pathWithoutLocale.substring(`/${loc}`.length);
        break;
      }
    }
    
    // Ensure path starts with /
    if (!pathWithoutLocale.startsWith('/')) {
      pathWithoutLocale = '/' + pathWithoutLocale;
    }
    
    // If path is just '/', make it empty for cleaner URLs
    if (pathWithoutLocale === '/') {
      pathWithoutLocale = '';
    }
    
    // Navigate to the new locale with always prefix
    router.push(`/${newLocale}${pathWithoutLocale}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{languageNames[locale as keyof typeof languageNames]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLanguage(loc)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  locale === loc ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                {languageNames[loc as keyof typeof languageNames]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}