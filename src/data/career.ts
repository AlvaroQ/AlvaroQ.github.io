export interface CareerNode {
  company: string;
  period: string;
  role: string;
  description: { es: string; en: string };
  skills: string[];
  color: string;
  icon?: string;
  type: 'STARTUP' | 'CONSULTANT' | 'CORPORATE' | 'SPECIALIST';
  logo?: string;
}

export const career: CareerNode[] = [
  {
    company: "TheRanking",
    period: "2013 - 2015",
    role: "Android & iOS Developer",
    description: {
      es: "Desarrollo cross-platform con Titanium. Apps startup con integraciones sociales.",
      en: "Cross-platform development with Titanium. Built startup apps with social integrations."
    },
    skills: ["Titanium", "Java", "REST APIs", "Git"],
    color: "var(--neon-cyan)",
    icon: "TR",
    type: "STARTUP",
    logo: "/images/logos/logo_theranking.png"
  },
  {
    company: "TalentoMOBILE",
    period: "2015 - 2017",
    role: "Senior Mobile Developer",
    description: {
      es: "Proyectos para Banco Santander: firma biométrica, reconocimiento facial, comandos de voz, NFC.",
      en: "Santander Bank projects: biometric signature, face recognition, voice commands, NFC."
    },
    skills: ["Android", "Biometrics", "voice commands", "Security"],
    color: "var(--neon-green)",
    icon: "TM",
    type: "CONSULTANT",
    logo: "/images/logos/logo_talento.png"
  },
  {
    company: "Santander UK",
    period: "2017",
    role: "Senior Developer & Android Specialist",
    description: {
      es: "On-site en Milton Keynes. Apps Retail & Business con Kotlin, NFC, OCR, geolocalización.",
      en: "On-site in Milton Keynes. Retail & Business apps with Kotlin, NFC, OCR, geolocation."
    },
    skills: ["Kotlin", "NFC", "OCR", "MVP"],
    color: "var(--santander-blue)",
    icon: "UK",
    type: "CORPORATE",
    logo: "/images/logos/logo_santander_uk.png"
  },
  {
    company: "B-FY",
    period: "2018 - Present",
    role: "App Development Director",
    description: {
      es: "Plataforma IDaaS passwordless para protección de identidad contra suplantación. Liderando desarrollo de SDKs en Android, iOS y Desktop con KMP.",
      en: "Passwordless IDaaS platform for identity protection against impersonation. Leading SDK development across Android, iOS and Desktop with KMP."
    },
    skills: ["KMP", "iOS", "Compose", "Ktor"],
    color: "var(--neon-magenta)",
    icon: "BF",
    type: "STARTUP",
    logo: "/images/logos/logo_bfy.png"
  },
  {
    company: "AI Specialist",
    period: "2024 - Present",
    role: "AI Agent Orchestrator",
    description: {
      es: "Construyendo sistemas inteligentes con LLMs, agentes autónomos y workflows potenciados por IA.",
      en: "Building intelligent systems with LLMs, autonomous agents, and AI-powered workflows."
    },
    skills: ["Claude", "LangChain", "MCP", "RAG"],
    color: "var(--orchid)",
    icon: "AI",
    type: "SPECIALIST"
  }
];
