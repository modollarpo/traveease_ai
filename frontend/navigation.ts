import { createNavigation } from 'next-intl/navigation';
import config from './i18n-config';

export const localePrefix = 'always' as const;

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: config.locales,
  defaultLocale: config.defaultLocale,
  localePrefix,
});
