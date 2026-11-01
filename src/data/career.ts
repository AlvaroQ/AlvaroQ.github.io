import type { Localized } from '../i18n';

/** Years in a role; no `to` means it is the current one. */
export interface Period {
  from: number;
  to?: number;
}

export interface CareerNode {
  company: string;
  period: Period;
  role: Localized;
  description: Localized;
  skills: string[];
  icon?: string;
  /** Image key relative to src/assets, e.g. "logos/logo_bfy.png". */
  logo?: string;
}

export const career: CareerNode[] = [
  {
    company: "TheRanking",
    period: { from: 2013, to: 2015 },
    role: { es: "Desarrollador Android e iOS", en: "Android & iOS Developer" },
    description: {
      es: "Desarrollo cross-platform con Titanium. Apps startup con integraciones sociales.",
      en: "Cross-platform development with Titanium. Built startup apps with social integrations."
    },
    skills: ["Titanium", "Java", "REST APIs", "Git"],
    icon: "TR",
    logo: "logos/logo_theranking.png"
  },
  {
    company: "TalentoMOBILE",
    period: { from: 2015, to: 2017 },
    role: { es: "Desarrollador Mobile sénior", en: "Senior Mobile Developer" },
    description: {
      es: "Proyectos para Banco Santander: firma biométrica, reconocimiento facial, comandos de voz, NFC.",
      en: "Santander Bank projects: biometric signature, face recognition, voice commands, NFC."
    },
    skills: ["Android", "Biometrics", "voice commands", "Security"],
    icon: "TM",
    logo: "logos/logo_talento.png"
  },
  {
    company: "Santander UK",
    period: { from: 2017, to: 2017 },
    role: { es: "Desarrollador sénior y especialista Android", en: "Senior Developer & Android Specialist" },
    description: {
      es: "On-site en Milton Keynes. Apps Retail & Business con Kotlin, NFC, OCR, geolocalización.",
      en: "On-site in Milton Keynes. Retail & Business apps with Kotlin, NFC, OCR, geolocation."
    },
    skills: ["Kotlin", "NFC", "OCR", "MVP"],
    icon: "UK",
    logo: "logos/logo_santander_uk.png"
  },
  {
    company: "B-FY",
    period: { from: 2018 },
    role: { es: "Director de desarrollo de apps", en: "App Development Director" },
    description: {
      es: "Plataforma IDaaS passwordless para protección de identidad contra suplantación. Liderando desarrollo de SDKs en Android, iOS y Desktop con KMP.",
      en: "Passwordless IDaaS platform for identity protection against impersonation. Leading SDK development across Android, iOS and Desktop with KMP."
    },
    skills: ["KMP", "iOS", "Compose", "Ktor"],
    icon: "BF",
    logo: "logos/logo_bfy.png"
  },
  {
    company: "AI Specialist",
    period: { from: 2024 },
    role: { es: "Orquestador de agentes de IA", en: "AI Agent Orchestrator" },
    description: {
      es: "Construyendo sistemas inteligentes con LLMs, agentes autónomos y workflows potenciados por IA.",
      en: "Building intelligent systems with LLMs, autonomous agents, and AI-powered workflows."
    },
    skills: ["Claude", "LangChain", "MCP", "RAG"],
    icon: "AI",
  }
];
