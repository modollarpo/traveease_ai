import type { Config } from 'next-intl/config';

const config = {
  locales: [
    'en',    // English
    'es',    // Spanish
    'fr',    // French
    'de',    // German
    'pt',    // Portuguese
    'ar',    // Arabic
    'zh',    // Simplified Chinese
    'ja',    // Japanese
    'ko',    // Korean
    'ru',    // Russian
    'it',    // Italian
    'nl',    // Dutch
    'yo',    // Yoruba (Nigerian)
    'ha',    // Hausa (Nigerian/West African)
    'sw',    // Swahili (East African)
  ],
  defaultLocale: 'en',
} satisfies Config;

export default config;
