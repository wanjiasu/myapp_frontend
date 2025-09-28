export const locales = ['en', 'zh', 'vi', 'th', 'es', 'pt', 'hi', 'ko'] as const;
export type Locale = typeof locales[number];