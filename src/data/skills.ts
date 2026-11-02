import type { Localized } from '../i18n';

export type SkillDepth = 'core' | 'solid' | 'familiar';

export interface Skill {
  name: string;
  /** Approximate years of hands-on use, derived from the career periods. */
  years: number;
  depth: SkillDepth;
}

export interface SkillCategory {
  title: Localized;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    title: { es: "Mobile y nativo", en: "Mobile & Native" },
    skills: [
      { name: "Kotlin", years: 9, depth: 'core' },
      { name: "Jetpack Compose", years: 5, depth: 'core' },
      { name: "KMP", years: 4, depth: 'core' },
      { name: "Android SDK", years: 13, depth: 'core' },
      { name: "iOS / Swift", years: 5, depth: 'familiar' },
      { name: "Flutter", years: 3, depth: 'familiar' }
    ]
  },
  {
    title: { es: "Web y backend", en: "Web & Backend" },
    skills: [
      { name: "Next.js / React", years: 5, depth: 'core' },
      { name: "TypeScript", years: 6, depth: 'core' },
      { name: "REST / GraphQL", years: 13, depth: 'core' },
      { name: "Python", years: 6, depth: 'core' },
      { name: "Firebase", years: 9, depth: 'solid' },
      { name: "Astro / Tailwind", years: 3, depth: 'solid' }
    ]
  },
  {
    title: { es: "IA y DevOps", en: "AI & DevOps" },
    skills: [
      { name: "Claude / Codex", years: 2, depth: 'core' },
      { name: "Prompt Engineering", years: 2, depth: 'core' },
      { name: "GPT / Gemini / Grok", years: 2, depth: 'solid' },
      { name: "LangChain", years: 2, depth: 'solid' },
      { name: "MCP / RAG", years: 2, depth: 'solid' },
      { name: "Jenkins / Appium", years: 2, depth: 'solid' }
    ]
  },
  {
    title: { es: "Seguridad e identidad", en: "Security & Identity" },
    skills: [
      { name: "Biometrics", years: 11, depth: 'core' },
      { name: "Authentication / IDaaS", years: 8, depth: 'core' },
      { name: "Encryption", years: 8, depth: 'solid' },
      { name: "Pen-testing", years: 3, depth: 'core' }
    ]
  }
];
