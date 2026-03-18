import { es } from './es';
import { en } from './en';
import type { Strings } from './es';

export type Lang = 'es' | 'en';

const translations: Record<Lang, Strings> = { es, en };

export function t(lang: Lang): Strings {
  return translations[lang] ?? translations.es;
}

export type { Strings };
