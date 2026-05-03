export interface ProjectDetails {
  longDescription: { es: string; en: string };
  architecture: { es: string; en: string };
  screenshots: string[];
  keyHighlights: { es: string; en: string }[];
  demoUrl?: string;
  githubUrl?: string;
}

export interface AIProject {
  title: string;
  subtitle: { es: string; en: string };
  description: { es: string; en: string };
  features: { es: string; en: string }[];
  techStack: string[];
  accentColor: string;
  githubUrl?: string;
  isLive?: boolean;
  isDiscontinued?: boolean;
  isFeatured?: boolean;
  detailedInfo?: ProjectDetails;
}

export const projects: AIProject[] = [
  // Fila 1: Adivina Perro, Cartera Investing, RAG Chatbot
  {
    title: "Adivina Perro",
    subtitle: {
      es: "Reconocimiento de Razas con IA On-Device",
      en: "On-Device AI Breed Recognition"
    },
    description: {
      es: "App Kotlin Multiplatform (Android + iOS) que combina un quiz de razas de perros con reconocimiento de raza por IA on-device en Android usando un modelo TFLite. Apunta la cámara a un perro y obtén la raza identificada en milisegundos, 100% offline.",
      en: "Kotlin Multiplatform app (Android + iOS) that combines a dog breed quiz with on-device AI breed recognition on Android using a TFLite model. Point the camera at a dog and get the breed identified in milliseconds, 100% offline."
    },
    features: [
      { es: "TFLite On-Device", en: "On-Device TFLite" },
      { es: "120 Razas Reconocibles", en: "120 Recognizable Breeds" },
      { es: "4 Modos de Juego", en: "4 Game Modes" },
      { es: "200+ Razas Catalogadas", en: "200+ Breed Catalogue" }
    ],
    techStack: ["Kotlin Multiplatform", "Compose Multiplatform", "TensorFlow Lite", "MobileNet V2", "CameraX", "Koin", "SQLDelight", "Firebase"],
    accentColor: "#EC9553",
    isLive: true,
    isFeatured: true,
    detailedInfo: {
      githubUrl: "https://github.com/AlvaroQ/AdivinaRaza",
      longDescription: {
        es: "App KMP para Android y iOS que combina un juego de razas de perros con reconocimiento por IA en el dispositivo, sin servidor y sin coste por petición.\n\n## Edge AI: Reconocimiento de Razas\nUn modelo MobileNet V2 optimizado y compilado a TensorFlow Lite ejecuta inferencia 100% on-device. La cámara captura la foto vía CameraX, la imagen se escala a 224×224 y se normaliza a [0, 1], el intérprete TFLite clasifica entre 120 razas y se muestran las top 5 predicciones con porcentaje de confianza. Tap en cualquier resultado abre la ficha completa de la raza.\n\n## Catálogo y Gameplay\n200+ razas con info detallada (origen, temperamento, tamaño, pelaje, ejercicio, cuidados, entrenabilidad, ladrido, datos curiosos), clasificación FCI, guías de nutrición e higiene, enfermedades comunes y nombres alternativos. Cuatro modos de juego: quiz clásico de raza, comparativa de peso/altura, adivinar por descripción y trivia FCI. Sistema de vidas, progresión por etapas y tracking de rachas.\n\n## Arquitectura Multiplataforma\nClean Architecture en 4 módulos KMP: `app` (Compose Multiplatform + plataformas), `usecases` (Pure Kotlin), `data` (repos + SQLDelight + mappers) y `core` (entidades). El interfaz `BreedClassifier` vive en `commonMain`; Android aporta la implementación TFLite, dejando el ViewModel agnóstico de plataforma y listo para una futura implementación iOS.\n\n## Decisiones de Diseño\nSQLDelight como source of truth y Firebase como semilla: una sincronización inicial alimenta SQLite y todas las queries posteriores son locales. MVVM con StateFlow granular en lugar de MVI (los formularios son pequeños y ortogonales). Koin sobre Hilt por compatibilidad KMP nativa sin kapt/ksp.",
        en: "KMP app for Android and iOS combining a dog breed quiz with on-device AI recognition — no server, no per-request cost.\n\n## Edge AI: Breed Recognition\nA MobileNet V2 model optimised and compiled to TensorFlow Lite runs inference 100% on-device. CameraX captures the photo, the image is scaled to 224×224 and normalised to [0, 1], the TFLite interpreter classifies across 120 breeds and the top 5 predictions are displayed with confidence percentages. Tap any result to open the full breed details.\n\n## Catalogue and Gameplay\n200+ breeds with detailed info (origin, temperament, size, coat, exercise needs, grooming, trainability, barking level, fun facts), FCI classification, nutrition and hygiene guides, common diseases and alternative names. Four game modes: classic breed quiz, weight/height comparison, description guessing and FCI trivia. Lives system, stage progression and streak tracking.\n\n## Multiplatform Architecture\nClean Architecture across 4 KMP modules: `app` (Compose Multiplatform + platforms), `usecases` (Pure Kotlin), `data` (repos + SQLDelight + mappers) and `core` (entities). The `BreedClassifier` interface lives in `commonMain`; Android provides the TFLite implementation, keeping the ViewModel platform-agnostic and ready for a future iOS implementation.\n\n## Design Decisions\nSQLDelight as source of truth and Firebase as the seed: an initial sync feeds SQLite and every subsequent query stays local. MVVM with granular StateFlow over MVI (forms are small and orthogonal). Koin over Hilt for native KMP compatibility without kapt/ksp."
      },
      architecture: {
        es: "Lenguaje: Kotlin Multiplatform 2.3.20\nUI: Compose Multiplatform (BOM 2026.03.01) + Material3\nPlataformas: Android (API 23+) + iOS (iosArm64 + iosSimulatorArm64)\nArquitectura: Clean Architecture, 4 módulos KMP (app, usecases, data, core) + MVVM\nEstado: StateFlow + SharedFlow (Coroutines 1.10.2)\nNavegación: Navigation Compose KMP type-safe 2.9.2\nDI: Koin Multiplatform 4.2.1\nIA on-device: TensorFlow Lite 2.17.0 (MobileNet V2 — 120 razas)\nCámara: CameraX (Android)\nPersistencia: SQLDelight 2.0.2 (Multiplatform)\nBackend: Firebase BOM 34.12.0 (Firestore, Realtime DB, Auth, Analytics, Crashlytics)\nMonetización: AdMob 25.2.0 (banner + rewarded + interstitial) + UMP 4.0.0\nTesting: 59 unit tests JVM (JUnit 4 + MockK + Turbine)",
        en: "Language: Kotlin Multiplatform 2.3.20\nUI: Compose Multiplatform (BOM 2026.03.01) + Material3\nPlatforms: Android (API 23+) + iOS (iosArm64 + iosSimulatorArm64)\nArchitecture: Clean Architecture, 4 KMP modules (app, usecases, data, core) + MVVM\nState: StateFlow + SharedFlow (Coroutines 1.10.2)\nNavigation: Navigation Compose KMP type-safe 2.9.2\nDI: Koin Multiplatform 4.2.1\nOn-device AI: TensorFlow Lite 2.17.0 (MobileNet V2 — 120 breeds)\nCamera: CameraX (Android)\nPersistence: SQLDelight 2.0.2 (Multiplatform)\nBackend: Firebase BOM 34.12.0 (Firestore, Realtime DB, Auth, Analytics, Crashlytics)\nMonetisation: AdMob 25.2.0 (banner + rewarded + interstitial) + UMP 4.0.0\nTesting: 59 unit tests JVM (JUnit 4 + MockK + Turbine)"
      },
      screenshots: [
        "/images/projects/adivina-perro-banner.png"
      ],
      keyHighlights: [
        { es: "Reconocimiento de raza 100% on-device con TFLite — sin red, sin coste por petición", en: "100% on-device breed recognition with TFLite — no network, no per-request cost" },
        { es: "MobileNet V2 optimizado: 224×224 RGB, 120 clases, latencia en milisegundos", en: "Optimised MobileNet V2: 224×224 RGB, 120 classes, millisecond latency" },
        { es: "Top 5 predicciones con porcentaje de confianza y navegación directa al detalle", en: "Top 5 predictions with confidence percentages and direct navigation to detail" },
        { es: "Catálogo de 200+ razas con info de cuidados, FCI, dieta y enfermedades", en: "Catalogue of 200+ breeds with care info, FCI, diet and diseases" },
        { es: "4 modos de juego: quiz clásico, peso/altura, descripción y trivia FCI", en: "4 game modes: classic quiz, weight/height, description and FCI trivia" },
        { es: "Clean Architecture en 4 módulos KMP con interfaz BreedClassifier en commonMain", en: "Clean Architecture across 4 KMP modules with BreedClassifier interface in commonMain" },
        { es: "59 unit tests pasando en CI (32 ViewModels + 14 use cases + 13 data)", en: "59 unit tests passing in CI (32 ViewModels + 14 use cases + 13 data)" },
        { es: "SQLDelight como source of truth, Firebase como semilla — playable offline", en: "SQLDelight as source of truth, Firebase as seed — playable offline" }
      ],
      demoUrl: "https://play.google.com/store/apps/details?id=com.alvaroquintana.adivinaperro"
    }
  },
  {
    title: "Cartera Investing",
    subtitle: {
      es: "Dashboard Financiero Personal",
      en: "Personal Financial Dashboard"
    },
    description: {
      es: "Dashboard financiero completo con 37+ módulos especializados: heatmaps sectoriales, análisis de concentración, equity curve, tracking de decisiones, informes fiscales y más. Doble vía de datos: carga automática desde NAS via bot Python que descarga CSVs de Investing, o subida manual de ficheros CSV para el área pública.",
      en: "Comprehensive financial dashboard with 37+ specialized modules: sector heatmaps, concentration analysis, equity curve, decision tracking, tax reports and more. Dual data pipeline: automated loading from NAS via Python bot that downloads CSVs from Investing, or manual CSV file upload for the public area."
    },
    features: [
      { es: "37+ Módulos Analytics", en: "37+ Analytics Modules" },
      { es: "Heatmap Sectorial", en: "Sector Heatmap" },
      { es: "Equity Curve & CAGR", en: "Equity Curve & CAGR" },
      { es: "Informes Fiscales", en: "Tax Reports" }
    ],
    techStack: ["Next.js 16", "React 19", "Firebase", "Recharts", "Zustand", "Tailwind CSS 4", "TypeScript", "Framer Motion"],
    accentColor: "#00E676",
    isLive: true,
    isFeatured: true,
    detailedInfo: {
      longDescription: {
        es: "Plataforma de analytics financiero diseñada para inversores individuales que quieren entender su cartera en profundidad.\n\n## Dashboard Modular\n37+ feature modules independientes organizados como bounded contexts: heatmap sectorial, análisis de concentración y riesgo, equity curve con CAGR, tracking de decisiones de compra/venta, dividendos, comparativa con índices y más.\n\n## Doble Vía de Datos\nPara el usuario propietario, un bot en Python desplegado en un Synology NAS descarga automáticamente los CSVs de Investing y los almacena como snapshots históricos. La app implementa carga progresiva: primero renderiza el último snapshot para mostrar el dashboard en segundos, luego descarga el historial completo en background.\n\nPara el área pública, los usuarios pueden adjuntar manualmente sus ficheros CSV exportados desde su broker y explorar el dashboard con sus propios datos.\n\n## Modo Demo\nLanding page pública con datos demo para que cualquiera pueda explorar las capacidades del dashboard sin necesidad de autenticación.\n\n## Arquitectura\nFeature-based architecture con 37+ módulos, cada uno con su propio types/services/hooks/components. State management con Zustand + React Query. Container queries para layouts responsive por panel.",
        en: "Financial analytics platform designed for individual investors who want to deeply understand their portfolio.\n\n## Modular Dashboard\n37+ independent feature modules organized as bounded contexts: sector heatmap, concentration and risk analysis, equity curve with CAGR, buy/sell decision tracking, dividends, index comparison and more.\n\n## Dual Data Pipeline\nFor the owner user, a Python bot deployed on a Synology NAS automatically downloads CSVs from Investing and stores them as historical snapshots. The app implements progressive loading: first renders the latest snapshot to show the dashboard in seconds, then downloads the full history in the background.\n\nFor the public area, users can manually attach their CSV files exported from their broker and explore the dashboard with their own data.\n\n## Demo Mode\nPublic landing page with demo data so anyone can explore the dashboard capabilities without authentication.\n\n## Architecture\nFeature-based architecture with 37+ modules, each with its own types/services/hooks/components. State management with Zustand + React Query. Container queries for responsive per-panel layouts."
      },
      architecture: {
        es: "Frontend: Next.js 16 App Router + React 19 + React Compiler\nUI: Tailwind CSS 4 + shadcn/ui + Recharts\nState: Zustand (client) + TanStack React Query (server)\nAnimaciones: Framer Motion\nBackend: Firebase (Auth + Firestore)\nDatos: Bot Python en Synology NAS (auto-descarga CSV de Investing) + subida manual CSV\nDespliegue: Vercel\nTesting: Vitest + Playwright",
        en: "Frontend: Next.js 16 App Router + React 19 + React Compiler\nUI: Tailwind CSS 4 + shadcn/ui + Recharts\nState: Zustand (client) + TanStack React Query (server)\nAnimations: Framer Motion\nBackend: Firebase (Auth + Firestore)\nData: Python bot on Synology NAS (auto-downloads CSV from Investing) + manual CSV upload\nDeployment: Vercel\nTesting: Vitest + Playwright"
      },
      screenshots: [
        "/images/projects/sesion-investing.webp",
        "/images/projects/cartera-investing.webp",
        "/images/projects/comparativa-investing.webp"
      ],
      keyHighlights: [
        { es: "37+ módulos analytics independientes como bounded contexts", en: "37+ independent analytics modules as bounded contexts" },
        { es: "Bot Python en NAS descarga CSVs de Investing automáticamente; área pública con subida manual de CSV", en: "Python bot on NAS auto-downloads CSVs from Investing; public area with manual CSV upload" },
        { es: "Heatmap sectorial interactivo con análisis de concentración", en: "Interactive sector heatmap with concentration analysis" },
        { es: "Equity curve con cálculo de CAGR y comparativa vs índices", en: "Equity curve with CAGR calculation and index comparison" },
        { es: "Tracking de decisiones de inversión con timeline visual", en: "Investment decision tracking with visual timeline" },
        { es: "Modo demo público para explorar sin autenticación", en: "Public demo mode to explore without authentication" },
        { es: "Container queries para layouts responsive por panel", en: "Container queries for responsive per-panel layouts" },
        { es: "Informes fiscales anuales exportables a PDF", en: "Annual tax reports exportable to PDF" }
      ],
      demoUrl: "https://www.invirtiendo.site/"
    }
  },
  {
    title: "RAG Chatbot",
    subtitle: { es: "Asistente IA", en: "AI Assistant" },
    description: {
      es: "Chatbot inteligente que responde preguntas sobre mi trayectoria profesional, habilidades técnicas y proyectos. Usa arquitectura RAG con embeddings vectoriales para ofrecer respuestas precisas y contextuales a reclutadores y empresas.",
      en: "Smart chatbot that answers questions about my career, technical skills and projects. Uses RAG architecture with vector embeddings to provide accurate, contextual responses to recruiters and companies."
    },
    features: [
      { es: "Arquitectura RAG", en: "RAG Architecture" },
      { es: "Embeddings Vectoriales", en: "Vector Embeddings" },
      { es: "100% Serverless", en: "100% Serverless" },
      { es: "Respuestas Contextuales", en: "Contextual Answers" }
    ],
    techStack: ["Cloudflare Workers", "Vectorize", "Llama 3.1", "BGE Embeddings"],
    accentColor: "#FF00FF",
    isLive: true,
    isFeatured: true,
    detailedInfo: {
      longDescription: {
        es: "Este chatbot representa mi visión de cómo la IA puede transformar la experiencia de reclutamiento. En lugar de que los recruiters lean páginas de CV, pueden simplemente preguntar lo que necesitan saber. El sistema usa RAG (Retrieval-Augmented Generation) para buscar en mi base de conocimiento vectorizada y generar respuestas precisas y contextuales.",
        en: "This chatbot represents my vision of how AI can transform the recruitment experience. Instead of recruiters reading pages of CVs, they can simply ask what they need to know. The system uses RAG (Retrieval-Augmented Generation) to search my vectorized knowledge base and generate precise, contextual answers."
      },
      architecture: {
        es: "Frontend: Widget JS embebido en portfolio\nBackend: Cloudflare Workers (Edge Computing)\nVector DB: Cloudflare Vectorize\nLLM: Llama 3.1 via Workers AI\nEmbeddings: BGE-base-en-v1.5\nDatos: Markdown con CV, proyectos y skills",
        en: "Frontend: JS widget embedded in portfolio\nBackend: Cloudflare Workers (Edge Computing)\nVector DB: Cloudflare Vectorize\nLLM: Llama 3.1 via Workers AI\nEmbeddings: BGE-base-en-v1.5\nData: Markdown with CV, projects and skills"
      },
      screenshots: ["/images/projects/rag-chatbot.webp"],
      keyHighlights: [
        { es: "Latencia <500ms gracias a edge computing", en: "Latency <500ms thanks to edge computing" },
        { es: "Coste $0 - 100% en free tier de Cloudflare", en: "Cost $0 - 100% on Cloudflare free tier" },
        { es: "Embeddings vectoriales para búsqueda semántica", en: "Vector embeddings for semantic search" },
        { es: "Respuestas en español e inglés", en: "Responses in Spanish and English" },
        { es: "Integrado directamente en este portfolio", en: "Integrated directly into this portfolio" }
      ]
    }
  },
  {
    title: "Translation & Voice AI",
    subtitle: { es: "100% Procesamiento Local", en: "100% Local Processing" },
    description: {
      es: "App de escritorio que convierte documentos (PDF, Word, TXT) en audio de alta calidad usando modelos IA locales. Sin nube, sin costes, privacidad total.",
      en: "Desktop app that converts documents (PDF, Word, TXT) into high-quality speech using local AI models. No cloud, no costs, full privacy."
    },
    features: [
      { es: "50+ Voces Neurales", en: "50+ Neural Voices" },
      { es: "200+ Idiomas", en: "200+ Languages" },
      { es: "Procesamiento Offline", en: "Offline Processing" },
      { es: "Soporte Documentos", en: "Document Support" }
    ],
    techStack: ["Python", "PyTorch", "ONNX", "Kokoro-82M", "NLLB-200"],
    accentColor: "#00FFFF",
    githubUrl: "https://github.com/AlvaroQ/TranslationAndVoiceLocally",
    detailedInfo: {
      longDescription: {
        es: "Desarrollé esta herramienta para resolver un problema real: convertir documentación técnica y libros a audio para escucharlos mientras conduzco o hago ejercicio. A diferencia de servicios cloud como ElevenLabs o Google TTS, todo el procesamiento ocurre localmente, garantizando privacidad total y sin costes recurrentes.",
        en: "I developed this tool to solve a real problem: converting technical documentation and books to audio to listen while driving or exercising. Unlike cloud services like ElevenLabs or Google TTS, all processing happens locally, guaranteeing total privacy and no recurring costs."
      },
      architecture: {
        es: "UI: Python + Tkinter (cross-platform)\nTTS Engine: Kokoro-82M (neural voices)\nTranslation: NLLB-200 (Meta AI)\nOptimización: ONNX Runtime para inferencia rápida\nFormatos: PDF, DOCX, TXT, EPUB",
        en: "UI: Python + Tkinter (cross-platform)\nTTS Engine: Kokoro-82M (neural voices)\nTranslation: NLLB-200 (Meta AI)\nOptimization: ONNX Runtime for fast inference\nFormats: PDF, DOCX, TXT, EPUB"
      },
      screenshots: ["/images/projects/translation-and-voice-locally.webp"],
      keyHighlights: [
        { es: "Voces neurales indistinguibles de humanos", en: "Neural voices indistinguishable from humans" },
        { es: "Traduce entre 200+ idiomas antes de sintetizar", en: "Translates between 200+ languages before synthesis" },
        { es: "Funciona 100% offline - sin internet requerido", en: "Works 100% offline - no internet required" },
        { es: "Optimizado con ONNX para GPUs consumer", en: "Optimized with ONNX for consumer GPUs" },
        { es: "Exporta a MP3, WAV, OGG con metadatos", en: "Exports to MP3, WAV, OGG with metadata" }
      ]
    }
  },
  // Fila 2: Portfolio & Stock, Web Scraper Pro, Lotto Scan
  {
    title: "Portfolio & Stock",
    subtitle: {
      es: "Cartera con Alertas Automatizadas",
      en: "Investment Management Platform with Automated Alerts"
    },
    description: {
      es: "Plataforma que gestiona inversiones múlti-brokers, genera informes fiscales, analiza fundamentales y envía alertas inteligentes diarias y semanales sobre precios objetivo y movimientos significativos del mercado. Arquitectura segura con Cloud Functions como middleware.",
      en: "Full-stack platform that consolidates investments from multiple brokers, generates tax reports, analyzes fundamentals with AI and sends intelligent daily and weekly alerts about target prices and significant market movements. Secure architecture with Cloud Functions as middleware."
    },
    features: [
      { es: "Alertas Automatizadas n8n", en: "Automated n8n Alerts" },
      { es: "Análisis Fundamental IA", en: "AI Fundamental Analysis" },
      { es: "Arquitectura Segura", en: "Secure Architecture" },
      { es: "Ratios de Valoración", en: "Valuation Ratios" }
    ],
    techStack: ["Next.js 15", "Firebase", "Cloud Functions", "n8n", "Docker", "Gemini 2.0", "Perplexity AI", "TypeScript"],
    accentColor: "#FFFF00",
    isDiscontinued: true,
    isFeatured: true,
    detailedInfo: {
      longDescription: {
        es: "⚠️ Proyecto descontinuado: El desarrollo se encuentra congelado debido a los elevados costos de suscripción a APIs financieras necesarias para datos en tiempo real. Video demo próximamente.\n\nPlataforma integral que consolida inversiones de múltiples brokers, genera informes fiscales y permite tomar decisiones basadas en datos.\n\n## Dashboard\nVisión global con índices mundiales, materias primas y sectores. Cada acción incluye ficha con fundamentales, gráficos históricos, ratios (PER, PEG, EV/EBITDA, P/B) y fórmulas automatizadas (DCF, Graham, Lynch) para detectar oportunidades.\n\n## Sistema de Alertas Inteligentes\nHe desplegado un contenedor Docker con n8n en mi NAS Synology que ejecuta workflows automatizados diarios y semanales con dos frentes de análisis:\n› Alertas de Precio Objetivo: Compara los precios de alerta del usuario (Firebase) con cotizaciones en tiempo real, notificando cuando un valor alcanza su objetivo de compra o venta.\n› Análisis de Movimientos: Identifica las mayores subidas y bajadas de tu cartera, busca noticias relevantes con IA y analiza las posibles causas de cada movimiento.\n\n## Seguridad como Prioridad\nToda comunicación con APIs externas pasa por Cloud Functions como middleware seguro: protege claves de API, valida peticiones y garantiza que datos sensibles nunca se exponen al cliente.\n\n## Análisis y Reporting\nInformes anuales con rentabilidades, mejores/peores valores y posiciones cerradas para declaración fiscal.",
        en: "⚠️ Discontinued project: Development is frozen due to the high subscription costs of financial APIs required for real-time data. Demo video coming soon.\n\nComprehensive platform that consolidates investments from multiple brokers, generates tax reports and enables data-driven decisions.\n\n## Dashboard\nGlobal vision with world indices, commodities and sectors. Each stock includes fundamentals, historical charts, ratios (P/E, PEG, EV/EBITDA, P/B) and automated formulas (DCF, Graham, Lynch) to detect opportunities.\n\n## Intelligent Alert System\nI've deployed a Docker container with n8n on my Synology NAS running automated daily and weekly workflows with two analysis fronts:\n› Target Price Alerts: Compares user alert prices (Firebase) with real-time quotes, notifying when a stock reaches its buy or sell target.\n› Movement Analysis: Identifies the biggest gainers and losers in your portfolio, searches relevant news with AI and analyzes the causes behind each movement.\n\n## Security as Priority\nAll external API communication goes through Cloud Functions as secure middleware: protects API keys, validates requests and ensures sensitive data is never exposed to the client.\n\n## Analysis and Reporting\nAnnual reports with returns, best/worst performers and closed positions for tax filing."
      },
      architecture: {
        es: "Frontend: Next.js 15 App Router + React Server Components\nUI: TailwindCSS + Shadcn/ui + TradingView Charts\nBackend: Firebase (Auth, Firestore, Cloud Functions como middleware)\nAutomatización: Docker + n8n en Synology NAS (alertas diarias/semanales)\nIA Análisis: Gemini 2.0 Flash (fundamentales + gráficos)\nIA Noticias: Perplexity AI (sonar-pro)\nSeguridad: Cloud Functions validan y protegen todas las APIs\nDespliegue: Vercel + Firebase",
        en: "Frontend: Next.js 15 App Router + React Server Components\nUI: TailwindCSS + Shadcn/ui + TradingView Charts\nBackend: Firebase (Auth, Firestore, Cloud Functions as middleware)\nAutomation: Docker + n8n on Synology NAS (daily/weekly alerts)\nAI Analysis: Gemini 2.0 Flash (fundamentals + charts)\nAI News: Perplexity AI (sonar-pro)\nSecurity: Cloud Functions validate and protect all APIs\nDeployment: Vercel + Firebase"
      },
      screenshots: [
        "/images/projects/portfolio-and-stock-dashboard.webp",
        "/images/projects/portfolio-and-stock-cartera.webp",
        "/images/projects/portfolio-and-stock-stock.webp",
        "/images/projects/portfolio-and-stock-informe.webp"
      ],
      keyHighlights: [
        { es: "Alertas automáticas: precios objetivo y análisis de movimientos vía n8n + Docker", en: "Automated alerts: target prices and movement analysis via n8n + Docker" },
        { es: "Arquitectura segura: Cloud Functions como middleware protegiendo APIs", en: "Secure architecture: Cloud Functions as middleware protecting APIs" },
        { es: "Notificaciones inteligentes diarias y semanales con análisis de causas", en: "Intelligent daily and weekly notifications with cause analysis" },
        { es: "Informes fiscales anuales con rentabilidades y posiciones cerradas", en: "Annual tax reports with returns and closed positions" },
        { es: "Visión global: índices mundiales, materias primas y sectores", en: "Global vision: world indices, commodities and sectors" },
        { es: "Fórmulas de valoración automatizadas: DCF, Graham Number, Peter Lynch", en: "Automated valuation formulas: DCF, Graham Number, Peter Lynch" },
        { es: "Dashboard multi-broker con P&L en tiempo real y multi-divisa", en: "Multi-broker dashboard with real-time P&L and multi-currency" },
        { es: "IA busca noticias relevantes para explicar movimientos significativos", en: "AI searches relevant news to explain significant movements" }
      ]
    }
  },
  {
    title: "Web Scraper Pro",
    subtitle: { es: "Scraper con Anti-Detección", en: "Scraper with Anti-Detection" },
    description: {
      es: "Web scraper moderno con capacidades anti-detección. Captura páginas renderizadas con JavaScript y exporta a PDF, HTML, TXT o JSON.",
      en: "Modern web scraper with anti-detection capabilities. Captures JavaScript-rendered pages and exports to PDF, HTML, TXT, or JSON."
    },
    features: [
      { es: "Anti-Detección", en: "Anti-Detection" },
      { es: "Renderizado JS", en: "JS Rendering" },
      { es: "Multi-Formato Export", en: "Multi-Format Export" },
      { es: "Camoufox Fallback", en: "Camoufox Fallback" }
    ],
    techStack: ["Python", "FastAPI", "Playwright", "Camoufox", "Docker"],
    accentColor: "#8B00FF",
    githubUrl: "https://github.com/AlvaroQ/web-scraper",
    detailedInfo: {
      longDescription: {
        es: "Herramienta profesional de web scraping diseñada para extraer contenido de sitios web modernos que usan JavaScript para renderizar contenido.",
        en: "Professional web scraping tool designed to extract content from modern websites that use JavaScript to render content."
      },
      architecture: {
        es: "Backend: Python + FastAPI\nScraping: Playwright (headless browser)\nAnti-bot: Camoufox (Firefox stealth)\nExport: PDF, HTML, TXT, JSON\nDespliegue: Docker containerizado",
        en: "Backend: Python + FastAPI\nScraping: Playwright (headless browser)\nAnti-bot: Camoufox (Firefox stealth)\nExport: PDF, HTML, TXT, JSON\nDeployment: Docker containerized"
      },
      screenshots: ["/images/projects/scrapper_pro_preview.webp"],
      keyHighlights: [
        { es: "Captura páginas con contenido renderizado por JavaScript", en: "Captures pages with JavaScript-rendered content" },
        { es: "Sistema anti-detección con Camoufox para sitios protegidos", en: "Anti-detection system with Camoufox for protected sites" },
        { es: "Exportación a múltiples formatos: PDF, HTML, TXT, JSON", en: "Export to multiple formats: PDF, HTML, TXT, JSON" },
        { es: "Arquitectura containerizada con Docker", en: "Containerized architecture with Docker" }
      ]
    }
  },
  {
    title: "Lotto Scan",
    subtitle: { es: "Escáner OCR con IA", en: "AI-Powered OCR Scanner" },
    description: {
      es: "App Kotlin Multiplatform que escanea y gestiona boletos de lotería española usando OCR con IA.",
      en: "Kotlin Multiplatform app that scans and manages Spanish lottery tickets using AI-powered OCR."
    },
    features: [
      { es: "Multi-Lotería", en: "Multi-Lottery Support" },
      { es: "OCR Offline", en: "Offline OCR" },
      { es: "Puntuación de Confianza", en: "Confidence Scoring" },
      { es: "Almacenamiento Local", en: "Local Storage" }
    ],
    techStack: ["Kotlin", "Compose MP", "PaddleOCR", "ONNX", "SQLDelight"],
    accentColor: "#DA70D6",
    githubUrl: "https://github.com/AlvaroQ/lotto-scan",
    detailedInfo: {
      longDescription: {
        es: "Este proyecto combina mi experiencia en Kotlin Multiplatform con IA on-device. La app escanea boletos de lotería española usando la cámara del dispositivo y extrae los números automáticamente con OCR.",
        en: "This project combines my expertise in Kotlin Multiplatform with on-device AI. The app scans Spanish lottery tickets using the device camera and automatically extracts numbers with OCR."
      },
      architecture: {
        es: "UI: Compose Multiplatform (Android + Desktop)\nOCR: PaddleOCR Lite optimizado para mobile\nInferencia: ONNX Runtime para cross-platform\nDB: SQLDelight (type-safe SQL)\nDI: Koin Multiplatform\nAsync: Kotlin Coroutines + Flow",
        en: "UI: Compose Multiplatform (Android + Desktop)\nOCR: PaddleOCR Lite optimized for mobile\nInference: ONNX Runtime for cross-platform\nDB: SQLDelight (type-safe SQL)\nDI: Koin Multiplatform\nAsync: Kotlin Coroutines + Flow"
      },
      screenshots: [
        "/images/projects/lotto-scan-camera.webp",
        "/images/projects/lotto-scan-preview.webp"
      ],
      keyHighlights: [
        { es: "KMP real: mismo código en Android y Desktop", en: "Real KMP: same code on Android and Desktop" },
        { es: "OCR on-device con PaddleOCR optimizado", en: "On-device OCR with optimized PaddleOCR" },
        { es: "Puntuación de confianza por cada número detectado", en: "Confidence score for each detected number" },
        { es: "Historial de boletos con SQLDelight", en: "Ticket history with SQLDelight" },
        { es: "Comprobación automática de premios", en: "Automatic prize checking" }
      ]
    }
  },
  // Fila 3: YouTube Downloader, Chart Analyzer
  {
    title: "YouTube Downloader",
    subtitle: { es: "Descargador con Resúmenes IA", en: "Downloader with AI Summaries" },
    description: {
      es: "Descargador de YouTube moderno con resúmenes de video generados por IA. Interfaz glassmorphism, extracción de video/audio y soporte multi-proveedor IA.",
      en: "Modern YouTube downloader with AI-powered video summaries. Features a glassmorphism UI, video/audio extraction, and multi-provider AI support."
    },
    features: [
      { es: "Resúmenes con IA", en: "AI Summaries" },
      { es: "Extracción Video/Audio", en: "Video/Audio Extraction" },
      { es: "UI Glassmorphism", en: "Glassmorphism UI" },
      { es: "Multi-Formato", en: "Multi-Format" }
    ],
    techStack: ["Python", "FastAPI", "Perplexity AI", "JavaScript", "HTML/CSS"],
    accentColor: "#FF0080",
    githubUrl: "https://github.com/AlvaroQ/youtube-downloader",
    detailedInfo: {
      longDescription: {
        es: "Herramienta de escritorio que combina descarga de contenido de YouTube con análisis inteligente mediante IA.",
        en: "Desktop tool that combines YouTube content downloading with intelligent AI analysis."
      },
      architecture: {
        es: "Backend: Python + FastAPI\nDescarga: yt-dlp\nIA: Perplexity AI para resúmenes\nFrontend: HTML/CSS/JavaScript con glassmorphism\nFormatos: MP4, MP3, WebM, múltiples calidades",
        en: "Backend: Python + FastAPI\nDownload: yt-dlp\nAI: Perplexity AI for summaries\nFrontend: HTML/CSS/JavaScript with glassmorphism\nFormats: MP4, MP3, WebM, multiple qualities"
      },
      screenshots: ["/images/projects/youtube_downloader_preview.webp"],
      keyHighlights: [
        { es: "Resúmenes automáticos de videos con Perplexity AI", en: "Automatic video summaries with Perplexity AI" },
        { es: "Extracción de audio para podcasts y música", en: "Audio extraction for podcasts and music" },
        { es: "Interfaz moderna con efecto glassmorphism", en: "Modern interface with glassmorphism effect" },
        { es: "Soporte para múltiples formatos y calidades", en: "Support for multiple formats and qualities" }
      ]
    }
  },
  {
    title: "Chart Analyzer",
    subtitle: { es: "Inteligencia de Mercado en Tiempo Real", en: "Real-time Market Intelligence" },
    description: {
      es: "Plataforma full-stack que integra agentes IA para análisis financiero. Combina búsqueda de noticias con análisis técnico de gráficos para inversores.",
      en: "Full-stack platform integrating AI agents for financial analysis. Combines news search with technical chart analysis for investors."
    },
    features: [
      { es: "Noticias IA en Tiempo Real", en: "Real-time News AI" },
      { es: "Análisis de Gráficos", en: "Chart Analysis" },
      { es: "Detección de Patrones", en: "Pattern Detection" },
      { es: "Indicadores Técnicos", en: "Technical Indicators" }
    ],
    techStack: ["Next.js", "Perplexity AI", "Gemini 2.0", "TypeScript"],
    accentColor: "#39FF14",
    githubUrl: "https://github.com/AlvaroQ/chart-analyzer-and-stock-news",
    detailedInfo: {
      longDescription: {
        es: "Como inversor activo, necesitaba una herramienta que combinara análisis técnico con contexto de noticias en tiempo real. Este proyecto orquesta dos agentes IA.",
        en: "As an active investor, I needed a tool that combined technical analysis with real-time news context. This project orchestrates two AI agents."
      },
      architecture: {
        es: "Frontend: Next.js 14 App Router + TailwindCSS\nNews Agent: Perplexity AI API (sonar-pro)\nChart Agent: Gemini 2.0 Flash (vision)\nOrquestación: API Routes con streaming\nDespliegue: Vercel Edge Functions",
        en: "Frontend: Next.js 14 App Router + TailwindCSS\nNews Agent: Perplexity AI API (sonar-pro)\nChart Agent: Gemini 2.0 Flash (vision)\nOrchestration: API Routes with streaming\nDeployment: Vercel Edge Functions"
      },
      screenshots: ["/images/projects/chart-analyzer-and-stock-news.webp"],
      keyHighlights: [
        { es: "Análisis multimodal: texto (noticias) + visión (gráficos)", en: "Multimodal analysis: text (news) + vision (charts)" },
        { es: "Streaming de respuestas para UX fluida", en: "Response streaming for fluid UX" },
        { es: "Detecta patrones: head & shoulders, triángulos, canales", en: "Detects patterns: head & shoulders, triangles, channels" },
        { es: "Correlaciona noticias con movimientos de precio", en: "Correlates news with price movements" },
        { es: "100% TypeScript con tipos estrictos", en: "100% TypeScript with strict types" }
      ],
      demoUrl: "https://project-ia-three.vercel.app/"
    }
  }
];
