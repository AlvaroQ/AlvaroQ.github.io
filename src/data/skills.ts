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
    title: "Development",
    color: "var(--neon-green)",
    skills: [
      { name: "Kotlin", level: 95 },
      { name: "Android SDK", level: 92 },
      { name: "Jetpack Compose", level: 90 },
      { name: "KMP", level: 88 },
      { name: "HTML/JS/CSS", level: 85 },
      { name: "iOS / Swift", level: 70 }
    ]
  },
  {
    title: "AI / ML Orchestration",
    color: "var(--neon-magenta)",
    skills: [
      { name: "Claude / Anthropic", level: 90 },
      { name: "Prompt Engineering", level: 88 },
      { name: "LangChain", level: 85 },
      { name: "Cursor / Copilot", level: 83 },
      { name: "MCP Protocol", level: 81 },
      { name: "n8n", level: 75 }
    ]
  },
  {
    title: "Backend / Tools",
    color: "var(--neon-cyan)",
    skills: [
      { name: "REST / GraphQL", level: 92 },
      { name: "Git / CI-CD", level: 91 },
      { name: "Pen-testing", level: 89 },
      { name: "Firebase", level: 88 },
      { name: "Ktor", level: 82 },
      { name: "Domotics", level: 82 }
    ]
  }
];
