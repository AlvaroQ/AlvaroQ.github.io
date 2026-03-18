export interface Skill {
  name: string;
  level: number; // 0-100
}

export interface SkillCategory {
  title: string;
  color: string;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    title: "Mobile & Native",
    color: "var(--neon-green)",
    skills: [
      { name: "Kotlin", level: 95 },
      { name: "Jetpack Compose", level: 92 },
      { name: "KMP", level: 90 },
      { name: "Android SDK", level: 88 },
      { name: "iOS / Swift", level: 70 },
      { name: "Flutter", level: 65 }
    ]
  },
  {
    title: "Web & Backend",
    color: "var(--neon-cyan)",
    skills: [
      { name: "Next.js / React", level: 90 },
      { name: "TypeScript", level: 90 },
      { name: "REST / GraphQL", level: 88 },
      { name: "Python", level: 88 },
      { name: "Firebase", level: 85 },
      { name: "Astro / Tailwind", level: 85 }
    ]
  },
  {
    title: "AI & DevOps",
    color: "var(--neon-magenta)",
    skills: [
      { name: "Claude / Anthropic", level: 90 },
      { name: "Prompt Engineering", level: 88 },
      { name: "Docker / CI-CD", level: 88 },
      { name: "LangChain", level: 85 },
      { name: "MCP / RAG", level: 83 },
      { name: "n8n / Pen-testing", level: 78 }
    ]
  }
];
