import type { Localized } from '../i18n';

/** Years in a role; no `to` means it is the current one. */
export interface Period {
  from: number;
  to?: number;
}

export interface CareerNode {
  company: Localized;
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
    company: { es: "Inicios", en: "Early years" },
    period: { from: 2011, to: 2013 },
    role: { es: "Desarrollador web y mobile freelance", en: "Freelance Web & Mobile Developer" },
    description: {
      es: "Primeros proyectos web y Android y encargos freelance para clientes.",
      en: "First web and Android projects and freelance work for clients."
    },
    skills: ["Android", "Java", "Web"],
    icon: "11",
  },
  {
    company: { es: "TheRanking", en: "TheRanking" },
    period: { from: 2013, to: 2014 },
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
    company: { es: "TalentoMOBILE", en: "TalentoMOBILE" },
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
    company: { es: "Santander UK", en: "Santander UK" },
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
    company: { es: "B-FY", en: "B-FY" },
    period: { from: 2018 },
    role: { es: "App Development Lead", en: "App Development Lead" },
    description: {
      es: "Plataforma IDaaS passwordless contra la suplantación de identidad. Lidero los SDKs y apps en Android, iOS y desktop con KMP, y un flujo de release dirigido por agentes de IA.",
      en: "Passwordless IDaaS platform against identity fraud. I lead the SDKs and apps on Android, iOS and desktop with KMP, and an AI agent-driven release flow."
    },
    skills: ["KMP", "iOS", "Appium", "AI agents"],
    icon: "BF",
    logo: "logos/logo_bfy.png"
  },
  {
    company: { es: "Proyectos propios · IA", en: "Side projects · AI" },
    period: { from: 2024 },
    role: { es: "Agentes de IA de la idea al producto", en: "AI agents from idea to product" },
    description: {
      es: "Apps publicadas con LLMs y agentes: una competición bursátil entre cinco IAs, análisis de mercado y visión on-device.",
      en: "Shipped apps with LLMs and agents: a stock-market race between five AIs, market analysis and on-device vision."
    },
    skills: ["Claude", "LangChain", "MCP", "RAG"],
    icon: "AI",
  }
];
