// i18n contract: the only module components import language types and strings from.
import { es } from './es';
import { en } from './en';
import type { Strings } from './es';

export const LANGS = ['es', 'en'] as const;
export type Lang = (typeof LANGS)[number];
/** A text that exists in every supported language. */
export type Localized = Record<Lang, string>;

const translations: Record<Lang, Strings> = { es, en };

export function t(lang: Lang): Strings {
  return translations[lang];
}

export type { Strings };
