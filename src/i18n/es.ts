import { YEARS_IN_TECH } from '../data/site';

export const es = {
  // Page metadata
  pageTitle: "Álvaro Quintana | AI Engineer con base mobile (Kotlin/KMP)",
  pageDescription: `Álvaro Quintana, AI Engineer en Madrid con más de ${YEARS_IN_TECH} años en mobile (Android, iOS, Kotlin/KMP), seguridad e identidad. App Development Lead en B-FY.`,
  skipLink: "Saltar al contenido",
  portraitAlt: "Álvaro Quintana, AI Engineer con base mobile, en Madrid",
  ogImageAlt: "Álvaro Quintana en tinta sobre papel oscuro: AI Engineer con base mobile, en Madrid",
  location: "Madrid, España (remoto o híbrido)",

  // Header (ink signature hero)
  name: "Álvaro Quintana",
  heroEyebrow: `Madrid · ${YEARS_IN_TECH}+ años · Kotlin/KMP · Seguridad`,
  heroHeadline: "AI Engineer",
  heroHeadlineEm: "con base mobile",
  platforms: "Agentes IA · Kotlin/KMP · Android · iOS · CI/CD · Web",
  heroProof: "App Development Lead en B-FY · De semanas a media hora: releases verificadas por agentes de IA",
  heroCtaEmail: "Escríbeme",
  emailSubject: "Contacto desde alvaroq.github.io",
  inkPause: "Pausar tinta",
  inkResume: "Reanudar tinta",

  // Presentation
  hiImAlvaro: "Hola, soy Álvaro",
  jobTitle: "AI Engineer con base mobile — Kotlin/KMP, seguridad e identidad",
  linkedIn: "LinkedIn",
  github: "GitHub",
  bioP1: `AI Engineer con más de <strong>${YEARS_IN_TECH} años</strong> construyendo producto mobile —Android, iOS y <strong>Kotlin Multiplatform</strong>— y también web, con la seguridad y la identidad como hilo conductor. Antes desarrollé para Banco Santander en España y Reino Unido: firma biométrica, reconocimiento facial y NFC.`,
  bioP2: 'Hoy soy <strong>App Development Lead en B-FY</strong>, una plataforma IDaaS passwordless contra la suplantación de identidad, donde llevo los SDKs y las apps de Android, iOS y desktop con KMP. Allí monté un flujo dirigido por agentes de IA que planifica, implementa y verifica: tests E2E con Appium en dispositivo físico (happy path y KO, del enrollment a las operaciones), análisis de seguridad del APK, releases firmadas de Android e iOS y documentación en Jira con capturas y evidencias. Un proceso que podía llevar semanas se completa en <strong>poco más de media hora</strong>.',
  bioP3: 'Busco roles de <strong>AI Engineer</strong> o de liderazgo mobile donde la IA llegue a producto real: agentes, MCP y RAG sobre apps seguras, con Kotlin/KMP como base. Trabajo en remoto o en híbrido desde Madrid, en español o en inglés.',

  platformsNum: "4",
  platformsUnit: "entornos",
  platformsLabel: "ANDROID · iOS · WEB · DESKTOP",
  builtWithTech: "Sitio construido con",
  techName: "Astro + Tailwind CSS",

  stackLabel: "Stack principal",

  // Evolution
  careerTimeline: "Trayectoria",
  present: "hoy",
  careerSubtitle: "De desarrollador mobile a AI Engineer, con la seguridad como hilo conductor",
  yearsUnit: "años",
  yearsInTechLabel: "en Tech",
  yearsAtBfyLabel: "en B-FY",

  // AI Projects
  latestAiProjects: "Proyectos",
  showcasingProjects: "Mis últimas aplicaciones con IA, de la idea al producto.",
  projectLabel: "Proyecto",
  viewCase: "Ver el caso completo",
  viewOnGithub: "Ver en GitHub",
  liveBadge: "LIVE",
  tryIt: "Pruébalo",
  discontinuedBadge: "Descontinuado",

  // Case study modal
  caseContentLabel: "Contenido del caso",
  caseHighlights: "Aspectos clave",
  caseArchitecture: "Arquitectura",
  caseTechStack: "Stack tecnológico",
  caseScreenshots: "Capturas",
  caseClose: "Cerrar",
  caseOpenDemo: "Abrir demo",
  screenshotAlt: "Captura {n} de {title}",
  lightboxLabel: "Captura ampliada",
  lightboxPrev: "Imagen anterior",
  lightboxNext: "Imagen siguiente",
  lightboxClose: "Cerrar imagen",
  lightboxCounter: "{n} de {total}",

  // Chat widget
  chatTitle: "Chat con Álvaro",
  chatOpen: "Abrir chat",
  chatClose: "Cerrar chat",
  chatGreeting: "¡Hola! Soy el asistente virtual de Álvaro. Pregúntame por su experiencia, sus proyectos o sus habilidades.",
  chatInputLabel: "Tu pregunta",
  chatPlaceholder: "Pregunta sobre mi experiencia…",
  chatSend: "Enviar",
  chatTyping: "Pensando…",
  chatError: "No he podido procesar tu pregunta. Inténtalo de nuevo.",
  chatRateLimited: "Demasiadas preguntas seguidas. Espera un minuto e inténtalo de nuevo.",
  chatSuggestion1: "¿Experiencia con Kotlin?",
  chatSuggestion2: "¿Proyectos de IA?",
  chatSuggestion3: "¿Años de experiencia?",
  chatPrivacy: "Tu pregunta y el idioma se envían a un servicio externo para generar la respuesta. No incluyas datos personales.",

  // Skills
  skillsMatrix: "Habilidades",
  depthCore: "Núcleo",
  depthSolid: "Sólido",
  depthFamiliar: "Familiar",
  yearsShort: "años",

  // Contact
  connect: "Contacto",
  contactLead: "Vivo en Madrid y trabajo en remoto o en híbrido. Escríbeme.",
  whoami: "$ whoami",
  whoamiResult: "alvaro_quintana",
  catContact: "$ cat contacto.txt",
  emailLabel: "Email: ",
  locationLabel: "Ubicación: ",
  catLinks: "$ cat enlaces.txt",
  availableFor: "Abierto a roles Senior/Staff • Remoto o híbrido en Madrid • AI Engineer / Mobile • Español e inglés",

  // Theme/Language
  lightMode: "Claro",
  darkMode: "Oscuro",

  // Banner
  bannerText: "Vivo en Madrid pero trabajo en remoto, puedes contactarme por ",
  bannerTextShort: "Trabajo en remoto desde Madrid: escríbeme por ",
  bannerEmail: "email",

  // Navigation
  navHome: "Inicio",
  navAbout: "Sobre Mi",
  navCareer: "Trayectoria",
  navProjects: "Proyectos",
  navSkills: "Habilidades",
  navContact: "Contacto",

  // Accessibility
  a11yThemeToggle: "cambiar tema",
  altLanguageName: "English",
  a11yNavigation: "Menú de navegación",
  a11yCopyEmail: "copiar al portapapeles",
  a11yEmailCopied: "Email copiado",
} as const;

export type Strings = { readonly [K in keyof typeof es]: string };
