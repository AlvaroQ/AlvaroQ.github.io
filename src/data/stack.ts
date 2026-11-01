import type { Localized } from '../i18n';

export interface StackColumn {
  index: string;
  label: Localized;
  techs: string[];
}

/** Three-column strip under the bio: one key area per column, three techs each. */
export const stack: StackColumn[] = [
  { index: '01', label: { es: 'Mobile', en: 'Mobile' }, techs: ['Kotlin · Compose', 'Kotlin Multiplatform', 'Swift · iOS'] },
  { index: '02', label: { es: 'Web', en: 'Web' }, techs: ['Astro', 'Next.js · React', 'TypeScript'] },
  { index: '03', label: { es: 'IA', en: 'AI' }, techs: ['MCP · Skills', 'LangChain', 'RAG'] },
];
