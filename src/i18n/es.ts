export const es = {
  // Header
  systemInitialized: "[ SISTEMA INICIALIZADO ]",
  name: "ÁLVARO QUINTANA",
  subtitle: "INGENIERO FULL-STACK | MOBILE · WEB · IA",
  platforms: "Android | iOS | Web | CI/CD | Agentes IA",
  builtWith: "Hecho con ",
  usingTech: " usando Astro",

  // Presentation
  hiImAlvaro: "HOLA, SOY ÁLVARO",
  jobTitle: "Senior Full-Stack Engineer — Mobile, Web & AI",
  linkedIn: "LinkedIn",
  github: "GitHub",
  bioP1: 'Ingeniero full-stack con más de <strong>12 años de experiencia</strong> construyendo productos digitales de principio a fin — desde aplicaciones móviles nativas (<strong>Android</strong>, <strong>iOS</strong>) hasta plataformas web y pipelines de <strong>CI/CD</strong>. Actualmente lidero el desarrollo en <strong>B-FY</strong>, una plataforma <strong>IDaaS passwordless</strong> que protege a empresas contra la <strong>suplantación de identidad</strong>.',
  bioP2: 'Dominio profundo del ecosistema <strong>Kotlin</strong>: <strong>Jetpack Compose</strong>, <strong>Compose Multiplatform</strong> y <strong>KMP</strong> para compartir lógica de negocio entre Android, iOS, web y desktop. Diseño <strong>arquitecturas escalables</strong> con código limpio que se mantiene a largo plazo.',
  bioP3: 'En el lado web, desarrollo con <strong>Astro</strong>, <strong>Next.js</strong>, <strong>React</strong> y <strong>Tailwind CSS</strong>. Recientemente diseñé e implementé un <strong>pipeline CI/CD completo en Jenkins</strong> que incluye tests E2E con <strong>Appium</strong>, análisis estático con <strong>Detekt</strong>, escaneo de seguridad <strong>OWASP</strong>, documentación automatizada con <strong>Dokka</strong>, distribución vía <strong>Firebase App Distribution</strong> e integración con <strong>Jira</strong> — reduciendo el tiempo de release y garantizando calidad en cada build.',
  bioP4: 'Especializado en <strong>aplicaciones seguras</strong>: soluciones <strong>biométricas</strong>, <strong>encriptación</strong> y protocolos de <strong>autenticación</strong>. Mi experiencia práctica en <strong>IDaaS</strong> me da una perspectiva única sobre seguridad, privacidad y cumplimiento normativo.',
  bioP5: 'Mi siguiente frontera: <strong>Orquestación de Agentes IA</strong> con <strong>Claude</strong>, <strong>LangChain</strong>, <strong>MCP</strong> y <strong>RAG</strong>. Construyo sistemas inteligentes que integran IA en flujos de trabajo reales — desde asistentes de código hasta pipelines de datos automatizados.',

  yearsExperienceNum: "+12",
  yearsExperienceLabel: "AÑOS EXPERIENCIA",
  yearsLeadingNum: "+7",
  yearsLeadingLabel: "LIDERANDO B-FY",
  platformsNum: "4",
  platformsLabel: "PLATAFORMAS",
  platformsList: "ANDROID iOS WEB DESKTOP",
  builtWithTech: "// ESTE SITIO ESTÁ CONSTRUIDO CON",
  techName: "ASTRO + TAILWIND CSS",

  // Evolution
  careerTimeline: "TRAYECTORIA",
  careerSubtitle: "De desarrollador a ingeniero full-stack a especialista IA",
  yearsInTechLabel: "Años en Tech",
  yearsAtBfyLabel: "Años en B-FY",
  companiesLabel: "Empresas",

  // AI Projects
  latestAiProjects: "< ÚLTIMOS PROYECTOS IA />",
  showcasingProjects: "Mostrando mis últimas aplicaciones potenciadas por IA",
  keyFeatures: "CARACTERÍSTICAS CLAVE",
  techStack: "TECNOLOGÍAS",
  viewOnGithub: "> Ver en GitHub",
  liveBadge: "LIVE",
  tryIt: "Pruébalo",
  discontinuedBadge: "Descontinuado",
  featured: "DESTACADO",
  viewDetails: "Ver Detalles",
  clickToExpand: "Click para expandir",

  // Skills
  skillsMatrix: "HABILIDADES",

  // Contact
  connect: "CONECTAR",
  whoami: "$ whoami",
  whoamiResult: "alvaro_quintana",
  catContact: "$ cat contacto.txt",
  emailLabel: "Email: ",
  locationLabel: "Ubicación: ",
  catLinks: "$ cat enlaces.txt",
  availableFor: "Abierto a roles Senior/Staff • Remoto • Full-Stack / Mobile / IA",

  // Theme/Language
  lightMode: "[ CLARO ]",
  darkMode: "[ OSCURO ]",

  // Banner
  bannerText: "Vivo en Madrid pero trabajo en remoto, puedes contactarme por ",
  bannerEmail: "email",

  // Navigation
  navHome: "Inicio",
  navAbout: "Sobre Mi",
  navCareer: "Trayectoria",
  navProjects: "Proyectos",
  navSkills: "Habilidades",
  navContact: "Contacto",

  // Accessibility
  a11yThemeToggle: "Cambiar tema",
  a11yLanguageToggle: "Cambiar idioma",
  a11yNavigation: "Menú de navegación",
  a11yCopyEmail: "Copiar email al portapapeles",
  a11yEmailCopied: "Email copiado",
  a11yOpenLinkedIn: "Abrir perfil de LinkedIn",
  a11yOpenGitHub: "Abrir perfil de GitHub",
  a11yOpenProject: "Abrir proyecto en GitHub",
  a11ySkillLevel: "Nivel de habilidad",
} as const;

export type Strings = { readonly [K in keyof typeof es]: string };
