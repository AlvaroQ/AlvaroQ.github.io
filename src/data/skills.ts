export type SkillDepth = 'core' | 'solid' | 'familiar';

export interface Skill {
  name: string;
  /** Approximate years of hands-on use, derived from the career periods. */
  years: number;
  depth: SkillDepth;
}

export interface SkillCategory {
  title: string;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    title: "Mobile & Native",
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
    title: "Web & Backend",
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
    title: "AI & DevOps",
    skills: [
      { name: "Claude / Anthropic", years: 2, depth: 'core' },
      { name: "Prompt Engineering", years: 2, depth: 'core' },
      { name: "Docker / CI-CD", years: 8, depth: 'core' },
      { name: "LangChain", years: 2, depth: 'solid' },
      { name: "MCP / RAG", years: 2, depth: 'solid' },
      { name: "n8n / Pen-testing", years: 3, depth: 'solid' }
    ]
  }
];
