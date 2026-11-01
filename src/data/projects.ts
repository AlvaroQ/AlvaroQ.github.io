import type { Localized } from '../i18n';

export interface CaseStudy {
  longDescription: Localized;
  architecture: Localized;
  /** Image keys relative to src/assets, e.g. "projects/rag-chatbot.webp". */
  screenshots: string[];
  keyHighlights: Localized[];
}

/** External links must be https (checked by TypeScript here and by check-dist on the output). */
type HttpsUrl = `https://${string}`;

export interface ProjectLinks {
  github?: HttpsUrl;
  demo?: HttpsUrl;
}

export interface Project {
  /** Stable id: modal template key and history hash. */
  slug: string;
  title: string;
  subtitle: Localized;
  description: Localized;
  features: Localized[];
  techStack: string[];
  status?: 'live' | 'discontinued';
  links: ProjectLinks;
  caseStudy: CaseStudy;
}

export const projects: Project[] = [
  // Featured rows: Gran Premio IA, invirtiendo.site, Adivina Perro, RAG Chatbot
  {
    slug: "gran-premio-ia",
    title: "Gran Premio IA",
    subtitle: {
      es: "Cinco IAs compiten en bolsa como en la Fórmula 1",
      en: "Five AIs race the stock market, Formula 1 style"
    },
    description: {
      es: "Una simulación real de bolsa narrada como una carrera de Fórmula 1: cinco modelos de IA de frontera (GPT, Gemini, Claude, Grok y Muse) eligen cada uno una cartera de 8 acciones con 100.000 € y las mismas reglas, y compiten contra el S&P 500 con precios reales de mercado. Cada sesión de Wall Street es una vuelta reproducida con datos intradía, y un pipeline desatendido guioniza, locuta, renderiza y sube a YouTube el vídeo de cada vuelta.",
      en: "A real stock-market simulation told as a Formula 1 race: five frontier AI models (GPT, Gemini, Claude, Grok and Muse) each pick an 8-stock portfolio with €100,000 under the same rules and race the S&P 500 on real market prices. Every Wall Street session is a lap replayed from intraday data, and an unattended pipeline scripts, voices, renders and uploads each lap's video to YouTube."
    },
    features: [
      { es: "5 IAs contra el S&P 500", en: "5 AIs vs the S&P 500" },
      { es: "Cada Sesión, una Vuelta", en: "Every Session a Lap" },
      { es: "Vídeos Automáticos en YouTube", en: "Automated YouTube Videos" },
      { es: "Precios Reales de Mercado", en: "Real Market Prices" }
    ],
    techStack: ["Next.js 16", "React 19", "TanStack Query", "Recharts", "Yahoo Finance", "Claude Code", "Remotion", "Vercel"],
    status: 'live',
    links: { demo: "https://www.granpremioia.online/" },
    caseStudy: {
      longDescription: {
        es: "Gran Premio IA convierte la bolsa en un campeonato: cinco modelos de IA de frontera reciben las mismas reglas y 100.000 € cada uno, eligen una cartera de 8 acciones y compiten con precios reales contra el S&P 500, que hace de safety car.\n\n## La Carrera\nLa parrilla queda congelada en la salida: pesos y precios de entrada no cambian y una validación lo comprueba en cada build. Cada mes es un Gran Premio con su propio circuito y cada sesión de la NYSE es una vuelta; la clasificación es la rentabilidad acumulada en euros frente al S&P 500.\n\n## Replay de Cada Sesión\nCada vuelta se reproduce a partir de velas intradía de 5 minutos: el safety car recorre la sesión de 09:30 a 16:00 (Nueva York) y cada coche va por delante o por detrás según su diferencia. Un adelantamiento solo cuenta si la diferencia se sostiene, para que el ruido no invente pasadas.\n\n## Crónica Diaria con IA\nCada día laborable, tras el cierre, un agente en la nube investiga la sesión con fuentes, redacta los eventos de carrera, pasa type-check, lint, tests y build, y lo despliega en producción.\n\n## Del Cierre a YouTube sin Teclado\nUn pipeline desatendido arranca en cuanto llega la crónica: exporta los datos de la vuelta, Claude escribe el guion y los metadatos, la voz se sintetiza y se valida con Whisper, Remotion renderiza en 16:9 y 9:16 con el mismo circuito que la web y el vídeo se sube a YouTube con miniatura y capítulos.",
        en: "Gran Premio IA turns the stock market into a championship: five frontier AI models get the same rules and €100,000 each, pick an 8-stock portfolio and race on real prices against the S&P 500, which plays the safety car.\n\n## The Race\nThe grid is frozen at the start: weights and entry prices never change, and a validation checks it on every build. Each month is a Grand Prix on its own circuit and each NYSE session is a lap; the standings are the cumulative return in euros against the S&P 500.\n\n## Every Session Replayed\nEach lap is replayed from 5-minute intraday bars: the safety car drives the session from 09:30 to 16:00 (New York) and every car runs ahead or behind it by its gap. An overtake only counts when the gap holds, so noise never invents a pass.\n\n## Daily AI Race Report\nEvery weekday after the close, a cloud agent researches the session with sources, writes the race events, passes type-check, lint, tests and build, and ships it to production.\n\n## From the Close to YouTube, Hands-Free\nAn unattended pipeline starts as soon as the report lands: it exports the lap data, Claude writes the script and metadata, the voice is synthesised and checked with Whisper, Remotion renders 16:9 and 9:16 cuts on the same circuit as the website, and the video is uploaded to YouTube with thumbnail and chapters."
      },
      architecture: {
        es: "Frontend: Next.js 16 App Router + React 19 + React Compiler\nDatos: Yahoo Finance en servidor + TanStack Query, caché coordinada servidor/CDN/cliente\nGráficos: Recharts + circuitos propios en SVG\nDominio: matemática de carrera pura y validada, sin base de datos\nCrónica: agente Claude en la nube cada día laborable tras el cierre\nVídeo: Claude + síntesis de voz + Whisper + Remotion, subida a YouTube\nDespliegue: Vercel\nTesting: Vitest (300+ tests)",
        en: "Frontend: Next.js 16 App Router + React 19 + React Compiler\nData: Yahoo Finance on the server + TanStack Query, coordinated server/CDN/client caching\nCharts: Recharts + custom SVG circuits\nDomain: pure, validated race maths, no database\nRace report: Claude cloud agent every weekday after the close\nVideo: Claude + speech synthesis + Whisper + Remotion, uploaded to YouTube\nDeployment: Vercel\nTesting: Vitest (300+ tests)"
      },
      screenshots: [
        "projects/gran-premio-ia.webp"
      ],
      keyHighlights: [
        { es: "Cinco modelos de IA de frontera compiten con carteras reales frente al S&P 500", en: "Five frontier AI models race real-priced portfolios against the S&P 500" },
        { es: "Parrilla congelada y validada: mismas reglas, 100.000 € y 8 acciones por escudería", en: "Frozen, validated grid: same rules, €100,000 and 8 stocks per team" },
        { es: "Cada sesión de la NYSE se reproduce como una vuelta con velas intradía de 5 minutos", en: "Every NYSE session replayed as a lap from 5-minute intraday bars" },
        { es: "Adelantamientos con histéresis: el ruido del mercado no inventa pasadas", en: "Overtakes with hysteresis: market noise never invents a pass" },
        { es: "Agente en la nube que redacta la crónica de cada sesión y la despliega tras pasar todos los checks", en: "Cloud agent that writes each session's report and ships it after every check passes" },
        { es: "Pipeline desatendido: guion con Claude, voz sintetizada, render en Remotion y subida a YouTube", en: "Unattended pipeline: Claude script, synthesised voice, Remotion render and YouTube upload" },
        { es: "Vídeos 16:9 y 9:16 con el mismo circuito que la web", en: "16:9 and 9:16 videos on the same circuit as the website" },
        { es: "Matemática de carrera pura con caché coordinada entre servidor, CDN y cliente", en: "Pure race maths with caching coordinated across server, CDN and client" }
      ],
    }
  },
  {
    slug: "invirtiendo-site",
    title: "invirtiendo.site",
    subtitle: {
      es: "Monitor de Mercado y Cartera en Tiempo Real",
      en: "Real-Time Market Monitor & Portfolio Tracker"
    },
    description: {
      es: "Lo que empezó como el dashboard de mi cartera es hoy un centro de mando del mercado en tiempo real: índices globales, amplitud del S&P 500, rotación sectorial de ~436 empresas, macro y valoración de un vistazo, sin login. Rastrea las mejores oportunidades con un ranking GARP semanal, señales técnicas, el smart money de los 13F y mercados de predicción, y sigue tu cartera de acciones y ETFs al detalle: CAGR, Sharpe, drawdown, rayos X de ETFs y solapamientos.",
      en: "What began as my portfolio dashboard is now a real-time market command centre: global indices, S&P 500 breadth, sector rotation across ~436 companies, macro and valuation at a glance, no login. It tracks the best opportunities with a weekly GARP ranking, technical signals, 13F smart money and prediction markets, and follows your stock and ETF portfolio in depth: CAGR, Sharpe, drawdown, ETF X-ray and overlap."
    },
    features: [
      { es: "Mercado en Tiempo Real", en: "Real-Time Market" },
      { es: "Ranking GARP y Señales", en: "GARP Ranking & Signals" },
      { es: "Smart Money 13F", en: "13F Smart Money" },
      { es: "Cartera y Rayos X de ETFs", en: "Portfolio & ETF X-Ray" }
    ],
    techStack: ["Next.js 16", "React 19", "Firebase", "TanStack Query", "Zustand", "Lightweight Charts", "Yahoo Finance", "SEC EDGAR"],
    status: 'live',
    links: { demo: "https://www.invirtiendo.site/" },
    caseStudy: {
      longDescription: {
        es: "invirtiendo.site nació como el dashboard de mi cartera y ha crecido hasta convertirse en un monitor completo del mercado: qué se mueve, por qué y dónde están las mejores oportunidades, junto a un seguimiento a fondo de una cartera de acciones o ETFs.\n\n## El Mercado de un Vistazo\nÍndices globales, amplitud del S&P 500, rotación sectorial, macroeconomía y valoración en una sola pantalla y sin login. El mapa sectorial cubre 19 industrias y ~436 empresas cotizadas en EE. UU. con valoración Fair PE relativa, y cada empresa tiene su ficha con DCF interactivo y tesis de inversión.\n\n## Rastreo de Oportunidades\nRanking GARP cuantitativo recalculado cada semana (crecimiento, valoración, calidad y momentum), señales técnicas de compra (golden cross, ruptura de 52 semanas, pullback, recuperación de RSI, MACD alcista), movimientos de los superinversores en sus 13F, probabilidades de los mercados de predicción y una agenda de Fed, BCE, macro y resultados.\n\n## Tu Cartera al Detalle\nImporta tu CSV y obtén CAGR, volatilidad, Sharpe y máximo drawdown, rayos X de ETFs con detección de solapamientos, exposición a divisas, correlaciones, alertas de precio y tax-loss harvesting, con exportación a PDF y Excel.\n\n## Ingeniería\n85 módulos de feature con la misma estructura (tipos, servicios, hooks y componentes), pipelines de datos nocturnos y semanales que alimentan Firestore y un quality gate con type-check, lint, tests, escaneo de secretos y presupuestos de rendimiento en Playwright.",
        en: "invirtiendo.site started as my portfolio dashboard and has grown into a complete market monitor: what is moving, why, and where the best opportunities are, together with in-depth tracking of a stock or ETF portfolio.\n\n## The Market at a Glance\nGlobal indices, S&P 500 breadth, sector rotation, macroeconomics and valuation on a single screen, no login. The sector map covers 19 industries and ~436 US-listed companies valued on relative Fair P/E, and every company has its own page with an interactive DCF and an investment thesis.\n\n## Opportunity Tracking\nA quantitative GARP ranking recalculated every week (growth, valuation, quality and momentum), technical buy signals (golden cross, 52-week breakout, pullback, RSI recovery, bullish MACD), superinvestor moves from their 13F filings, prediction-market odds and a calendar of Fed, ECB, macro and earnings events.\n\n## Your Portfolio in Depth\nImport your CSV and get CAGR, volatility, Sharpe and maximum drawdown, an ETF X-ray with overlap detection, currency exposure, correlations, price alerts and tax-loss harvesting, with PDF and Excel export.\n\n## Engineering\n85 feature modules with the same structure (types, services, hooks and components), nightly and weekly data pipelines feeding Firestore, and a quality gate with type-check, lint, tests, secret scanning and Playwright performance budgets."
      },
      architecture: {
        es: "Frontend: Next.js 16 App Router + React 19 + React Compiler\nUI: Tailwind CSS 4 + Lightweight Charts + Recharts + Framer Motion\nEstado: Zustand (cliente) + TanStack Query (servidor)\nBackend: Firebase (Auth + Firestore, reglas con tests en emulador)\nDatos: Yahoo Finance, SEC EDGAR (13F), FRED, EODHD, Polymarket, AAII y RSS\nPipelines: jobs nocturnos en VPS + GitHub Actions semanales\nDespliegue: Vercel (PWA)\nTesting: Vitest (~650 ficheros de test) + Playwright con presupuestos de rendimiento",
        en: "Frontend: Next.js 16 App Router + React 19 + React Compiler\nUI: Tailwind CSS 4 + Lightweight Charts + Recharts + Framer Motion\nState: Zustand (client) + TanStack Query (server)\nBackend: Firebase (Auth + Firestore, rules tested in the emulator)\nData: Yahoo Finance, SEC EDGAR (13F), FRED, EODHD, Polymarket, AAII and RSS\nPipelines: nightly jobs on a VPS + weekly GitHub Actions\nDeployment: Vercel (PWA)\nTesting: Vitest (~650 test files) + Playwright with performance budgets"
      },
      screenshots: [
        "projects/invirtiendo-site.webp",
        "projects/sector-context-investing.webp",
        "projects/per-growth-investing.webp",
        "projects/sesion-investing.webp",
        "projects/cartera-investing.webp"
      ],
      keyHighlights: [
        { es: "Monitor de mercado en tiempo real sin login: índices, amplitud, sectores, macro y valoración", en: "Real-time market monitor with no login: indices, breadth, sectors, macro and valuation" },
        { es: "Mapa de 19 industrias y ~436 empresas con valoración Fair PE relativa", en: "Map of 19 industries and ~436 companies valued on relative Fair P/E" },
        { es: "Ranking GARP cuantitativo semanal y escáner de señales técnicas", en: "Weekly quantitative GARP ranking and technical-signal screener" },
        { es: "Smart money: movimientos trimestrales de los superinversores en sus 13F", en: "Smart money: superinvestors' quarterly moves from their 13F filings" },
        { es: "Mercados de predicción y agenda de Fed, BCE, macro y resultados", en: "Prediction markets and a Fed, ECB, macro and earnings calendar" },
        { es: "Cartera de acciones y ETFs: CAGR, Sharpe, drawdown, rayos X y solapamientos", en: "Stock and ETF portfolio: CAGR, Sharpe, drawdown, X-ray and overlap" },
        { es: "85 módulos de feature y pipelines de datos nocturnos y semanales hacia Firestore", en: "85 feature modules and nightly and weekly data pipelines into Firestore" },
        { es: "Quality gate con ~650 ficheros de test, escaneo de secretos y presupuestos de rendimiento", en: "Quality gate with ~650 test files, secret scanning and performance budgets" }
      ],
    }
  },
  {
    slug: "adivina-perro",
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
    status: 'live',
    links: { github: "https://github.com/AlvaroQ/AdivinaRaza", demo: "https://play.google.com/store/apps/details?id=com.alvaroquintana.adivinaperro" },
    caseStudy: {
      longDescription: {
        es: "App KMP para Android y iOS que combina un juego de razas de perros con reconocimiento por IA en el dispositivo, sin servidor y sin coste por petición.\n\n## Edge AI: Reconocimiento de Razas\nUn modelo MobileNet V2 optimizado y compilado a TensorFlow Lite ejecuta inferencia 100% on-device. La cámara captura la foto vía CameraX, la imagen se escala a 224×224 y se normaliza a [0, 1], el intérprete TFLite clasifica entre 120 razas y se muestran las top 5 predicciones con porcentaje de confianza. Tap en cualquier resultado abre la ficha completa de la raza.\n\n## Catálogo y Gameplay\n200+ razas con info detallada (origen, temperamento, tamaño, pelaje, ejercicio, cuidados, entrenabilidad, ladrido, datos curiosos), clasificación FCI, guías de nutrición e higiene, enfermedades comunes y nombres alternativos. Cuatro modos de juego: quiz clásico de raza, comparativa de peso/altura, adivinar por descripción y trivia FCI. Sistema de vidas, progresión por etapas y tracking de rachas.\n\n## Arquitectura Multiplataforma\nClean Architecture en 4 módulos KMP: `app` (Compose Multiplatform + plataformas), `usecases` (Pure Kotlin), `data` (repos + SQLDelight + mappers) y `core` (entidades). El interfaz `BreedClassifier` vive en `commonMain`; Android aporta la implementación TFLite, dejando el ViewModel agnóstico de plataforma y listo para una futura implementación iOS.\n\n## Decisiones de Diseño\nSQLDelight como source of truth y Firebase como semilla: una sincronización inicial alimenta SQLite y todas las queries posteriores son locales. MVVM con StateFlow granular en lugar de MVI (los formularios son pequeños y ortogonales). Koin sobre Hilt por compatibilidad KMP nativa sin kapt/ksp.",
        en: "KMP app for Android and iOS combining a dog breed quiz with on-device AI recognition — no server, no per-request cost.\n\n## Edge AI: Breed Recognition\nA MobileNet V2 model optimised and compiled to TensorFlow Lite runs inference 100% on-device. CameraX captures the photo, the image is scaled to 224×224 and normalised to [0, 1], the TFLite interpreter classifies across 120 breeds and the top 5 predictions are displayed with confidence percentages. Tap any result to open the full breed details.\n\n## Catalogue and Gameplay\n200+ breeds with detailed info (origin, temperament, size, coat, exercise needs, grooming, trainability, barking level, fun facts), FCI classification, nutrition and hygiene guides, common diseases and alternative names. Four game modes: classic breed quiz, weight/height comparison, description guessing and FCI trivia. Lives system, stage progression and streak tracking.\n\n## Multiplatform Architecture\nClean Architecture across 4 KMP modules: `app` (Compose Multiplatform + platforms), `usecases` (Pure Kotlin), `data` (repos + SQLDelight + mappers) and `core` (entities). The `BreedClassifier` interface lives in `commonMain`; Android provides the TFLite implementation, keeping the ViewModel platform-agnostic and ready for a future iOS implementation.\n\n## Design Decisions\nSQLDelight as source of truth and Firebase as the seed: an initial sync feeds SQLite and every subsequent query stays local. MVVM with granular StateFlow over MVI (forms are small and orthogonal). Koin over Hilt for native KMP compatibility without kapt/ksp."
      },
      architecture: {
        es: "Lenguaje: Kotlin Multiplatform 2.3.20\nUI: Compose Multiplatform (BOM 2026.03.01) + Material3\nPlataformas: Android (API 23+) + iOS (iosArm64 + iosSimulatorArm64)\nArquitectura: Clean Architecture, 4 módulos KMP (app, usecases, data, core) + MVVM\nEstado: StateFlow + SharedFlow (Coroutines 1.10.2)\nNavegación: Navigation Compose KMP type-safe 2.9.2\nDI: Koin Multiplatform 4.2.1\nIA on-device: TensorFlow Lite 2.17.0 (MobileNet V2 — 120 razas)\nCámara: CameraX (Android)\nPersistencia: SQLDelight 2.0.2 (Multiplatform)\nBackend: Firebase BOM 34.12.0 (Firestore, Realtime DB, Auth, Analytics, Crashlytics)\nMonetización: AdMob 25.2.0 (banner + rewarded + interstitial) + UMP 4.0.0\nTesting: 59 unit tests JVM (JUnit 4 + MockK + Turbine)",
        en: "Language: Kotlin Multiplatform 2.3.20\nUI: Compose Multiplatform (BOM 2026.03.01) + Material3\nPlatforms: Android (API 23+) + iOS (iosArm64 + iosSimulatorArm64)\nArchitecture: Clean Architecture, 4 KMP modules (app, usecases, data, core) + MVVM\nState: StateFlow + SharedFlow (Coroutines 1.10.2)\nNavigation: Navigation Compose KMP type-safe 2.9.2\nDI: Koin Multiplatform 4.2.1\nOn-device AI: TensorFlow Lite 2.17.0 (MobileNet V2 — 120 breeds)\nCamera: CameraX (Android)\nPersistence: SQLDelight 2.0.2 (Multiplatform)\nBackend: Firebase BOM 34.12.0 (Firestore, Realtime DB, Auth, Analytics, Crashlytics)\nMonetisation: AdMob 25.2.0 (banner + rewarded + interstitial) + UMP 4.0.0\nTesting: 59 unit tests JVM (JUnit 4 + MockK + Turbine)"
      },
      screenshots: [
        "projects/adivina-perro-banner.webp"
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
    }
  },
  {
    slug: "rag-chatbot",
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
    status: 'live',
    links: {},
    caseStudy: {
      longDescription: {
        es: "Este chatbot representa mi visión de cómo la IA puede transformar la experiencia de reclutamiento. En lugar de que los recruiters lean páginas de CV, pueden simplemente preguntar lo que necesitan saber. El sistema usa RAG (Retrieval-Augmented Generation) para buscar en mi base de conocimiento vectorizada y generar respuestas precisas y contextuales.",
        en: "This chatbot represents my vision of how AI can transform the recruitment experience. Instead of recruiters reading pages of CVs, they can simply ask what they need to know. The system uses RAG (Retrieval-Augmented Generation) to search my vectorized knowledge base and generate precise, contextual answers."
      },
      architecture: {
        es: "Frontend: Widget JS embebido en portfolio\nBackend: Cloudflare Workers (Edge Computing)\nVector DB: Cloudflare Vectorize\nLLM: Llama 3.1 via Workers AI\nEmbeddings: BGE-base-en-v1.5\nDatos: Markdown con CV, proyectos y skills",
        en: "Frontend: JS widget embedded in portfolio\nBackend: Cloudflare Workers (Edge Computing)\nVector DB: Cloudflare Vectorize\nLLM: Llama 3.1 via Workers AI\nEmbeddings: BGE-base-en-v1.5\nData: Markdown with CV, projects and skills"
      },
      screenshots: ["projects/rag-chatbot.webp"],
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
    slug: "translation-voice-ai",
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
    links: { github: "https://github.com/AlvaroQ/TranslationAndVoiceLocally" },
    caseStudy: {
      longDescription: {
        es: "Desarrollé esta herramienta para resolver un problema real: convertir documentación técnica y libros a audio para escucharlos mientras conduzco o hago ejercicio. A diferencia de servicios cloud como ElevenLabs o Google TTS, todo el procesamiento ocurre localmente, garantizando privacidad total y sin costes recurrentes.",
        en: "I developed this tool to solve a real problem: converting technical documentation and books to audio to listen while driving or exercising. Unlike cloud services like ElevenLabs or Google TTS, all processing happens locally, guaranteeing total privacy and no recurring costs."
      },
      architecture: {
        es: "UI: Python + Tkinter (cross-platform)\nTTS Engine: Kokoro-82M (neural voices)\nTranslation: NLLB-200 (Meta AI)\nOptimización: ONNX Runtime para inferencia rápida\nFormatos: PDF, DOCX, TXT, EPUB",
        en: "UI: Python + Tkinter (cross-platform)\nTTS Engine: Kokoro-82M (neural voices)\nTranslation: NLLB-200 (Meta AI)\nOptimization: ONNX Runtime for fast inference\nFormats: PDF, DOCX, TXT, EPUB"
      },
      screenshots: ["projects/translation-and-voice-locally.webp"],
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
    slug: "portfolio-stock",
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
    status: 'discontinued',
    links: {},
    caseStudy: {
      longDescription: {
        es: "⚠️ Proyecto descontinuado: El desarrollo se encuentra congelado debido a los elevados costos de suscripción a APIs financieras necesarias para datos en tiempo real. Video demo próximamente.\n\nPlataforma integral que consolida inversiones de múltiples brokers, genera informes fiscales y permite tomar decisiones basadas en datos.\n\n## Dashboard\nVisión global con índices mundiales, materias primas y sectores. Cada acción incluye ficha con fundamentales, gráficos históricos, ratios (PER, PEG, EV/EBITDA, P/B) y fórmulas automatizadas (DCF, Graham, Lynch) para detectar oportunidades.\n\n## Sistema de Alertas Inteligentes\nHe desplegado un contenedor Docker con n8n en mi NAS Synology que ejecuta workflows automatizados diarios y semanales con dos frentes de análisis:\n› Alertas de Precio Objetivo: Compara los precios de alerta del usuario (Firebase) con cotizaciones en tiempo real, notificando cuando un valor alcanza su objetivo de compra o venta.\n› Análisis de Movimientos: Identifica las mayores subidas y bajadas de tu cartera, busca noticias relevantes con IA y analiza las posibles causas de cada movimiento.\n\n## Seguridad como Prioridad\nToda comunicación con APIs externas pasa por Cloud Functions como middleware seguro: protege claves de API, valida peticiones y garantiza que datos sensibles nunca se exponen al cliente.\n\n## Análisis y Reporting\nInformes anuales con rentabilidades, mejores/peores valores y posiciones cerradas para declaración fiscal.",
        en: "⚠️ Discontinued project: Development is frozen due to the high subscription costs of financial APIs required for real-time data. Demo video coming soon.\n\nComprehensive platform that consolidates investments from multiple brokers, generates tax reports and enables data-driven decisions.\n\n## Dashboard\nGlobal vision with world indices, commodities and sectors. Each stock includes fundamentals, historical charts, ratios (P/E, PEG, EV/EBITDA, P/B) and automated formulas (DCF, Graham, Lynch) to detect opportunities.\n\n## Intelligent Alert System\nI've deployed a Docker container with n8n on my Synology NAS running automated daily and weekly workflows with two analysis fronts:\n› Target Price Alerts: Compares user alert prices (Firebase) with real-time quotes, notifying when a stock reaches its buy or sell target.\n› Movement Analysis: Identifies the biggest gainers and losers in your portfolio, searches relevant news with AI and analyzes the causes behind each movement.\n\n## Security as Priority\nAll external API communication goes through Cloud Functions as secure middleware: protects API keys, validates requests and ensures sensitive data is never exposed to the client.\n\n## Analysis and Reporting\nAnnual reports with returns, best/worst performers and closed positions for tax filing."
      },
      architecture: {
        es: "Frontend: Next.js 15 App Router + React Server Components\nUI: TailwindCSS + Shadcn/ui + TradingView Charts\nBackend: Firebase (Auth, Firestore, Cloud Functions como middleware)\nAutomatización: Docker + n8n en Synology NAS (alertas diarias/semanales)\nIA Análisis: Gemini 2.0 Flash (fundamentales + gráficos)\nIA Noticias: Perplexity AI (sonar-pro)\nSeguridad: Cloud Functions validan y protegen todas las APIs\nDespliegue: Vercel + Firebase",
        en: "Frontend: Next.js 15 App Router + React Server Components\nUI: TailwindCSS + Shadcn/ui + TradingView Charts\nBackend: Firebase (Auth, Firestore, Cloud Functions as middleware)\nAutomation: Docker + n8n on Synology NAS (daily/weekly alerts)\nAI Analysis: Gemini 2.0 Flash (fundamentals + charts)\nAI News: Perplexity AI (sonar-pro)\nSecurity: Cloud Functions validate and protect all APIs\nDeployment: Vercel + Firebase"
      },
      screenshots: [
        "projects/portfolio-and-stock-dashboard.webp",
        "projects/portfolio-and-stock-cartera.webp",
        "projects/portfolio-and-stock-stock.webp",
        "projects/portfolio-and-stock-informe.webp"
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
    slug: "web-scraper-pro",
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
    links: { github: "https://github.com/AlvaroQ/web-scraper" },
    caseStudy: {
      longDescription: {
        es: "Herramienta profesional de web scraping diseñada para extraer contenido de sitios web modernos que usan JavaScript para renderizar contenido.",
        en: "Professional web scraping tool designed to extract content from modern websites that use JavaScript to render content."
      },
      architecture: {
        es: "Backend: Python + FastAPI\nScraping: Playwright (headless browser)\nAnti-bot: Camoufox (Firefox stealth)\nExport: PDF, HTML, TXT, JSON\nDespliegue: Docker containerizado",
        en: "Backend: Python + FastAPI\nScraping: Playwright (headless browser)\nAnti-bot: Camoufox (Firefox stealth)\nExport: PDF, HTML, TXT, JSON\nDeployment: Docker containerized"
      },
      screenshots: ["projects/scrapper_pro_preview.webp"],
      keyHighlights: [
        { es: "Captura páginas con contenido renderizado por JavaScript", en: "Captures pages with JavaScript-rendered content" },
        { es: "Sistema anti-detección con Camoufox para sitios protegidos", en: "Anti-detection system with Camoufox for protected sites" },
        { es: "Exportación a múltiples formatos: PDF, HTML, TXT, JSON", en: "Export to multiple formats: PDF, HTML, TXT, JSON" },
        { es: "Arquitectura containerizada con Docker", en: "Containerized architecture with Docker" }
      ]
    }
  },
  {
    slug: "lotto-scan",
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
    links: { github: "https://github.com/AlvaroQ/lotto-scan" },
    caseStudy: {
      longDescription: {
        es: "Este proyecto combina mi experiencia en Kotlin Multiplatform con IA on-device. La app escanea boletos de lotería española usando la cámara del dispositivo y extrae los números automáticamente con OCR.",
        en: "This project combines my expertise in Kotlin Multiplatform with on-device AI. The app scans Spanish lottery tickets using the device camera and automatically extracts numbers with OCR."
      },
      architecture: {
        es: "UI: Compose Multiplatform (Android + Desktop)\nOCR: PaddleOCR Lite optimizado para mobile\nInferencia: ONNX Runtime para cross-platform\nDB: SQLDelight (type-safe SQL)\nDI: Koin Multiplatform\nAsync: Kotlin Coroutines + Flow",
        en: "UI: Compose Multiplatform (Android + Desktop)\nOCR: PaddleOCR Lite optimized for mobile\nInference: ONNX Runtime for cross-platform\nDB: SQLDelight (type-safe SQL)\nDI: Koin Multiplatform\nAsync: Kotlin Coroutines + Flow"
      },
      screenshots: [
        "projects/lotto-scan-camera.webp",
        "projects/lotto-scan-preview.webp"
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
    slug: "youtube-downloader",
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
    links: { github: "https://github.com/AlvaroQ/youtube-downloader" },
    caseStudy: {
      longDescription: {
        es: "Herramienta de escritorio que combina descarga de contenido de YouTube con análisis inteligente mediante IA.",
        en: "Desktop tool that combines YouTube content downloading with intelligent AI analysis."
      },
      architecture: {
        es: "Backend: Python + FastAPI\nDescarga: yt-dlp\nIA: Perplexity AI para resúmenes\nFrontend: HTML/CSS/JavaScript con glassmorphism\nFormatos: MP4, MP3, WebM, múltiples calidades",
        en: "Backend: Python + FastAPI\nDownload: yt-dlp\nAI: Perplexity AI for summaries\nFrontend: HTML/CSS/JavaScript with glassmorphism\nFormats: MP4, MP3, WebM, multiple qualities"
      },
      screenshots: ["projects/youtube_downloader_preview.webp"],
      keyHighlights: [
        { es: "Resúmenes automáticos de videos con Perplexity AI", en: "Automatic video summaries with Perplexity AI" },
        { es: "Extracción de audio para podcasts y música", en: "Audio extraction for podcasts and music" },
        { es: "Interfaz moderna con efecto glassmorphism", en: "Modern interface with glassmorphism effect" },
        { es: "Soporte para múltiples formatos y calidades", en: "Support for multiple formats and qualities" }
      ]
    }
  },
  {
    slug: "chart-analyzer",
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
    links: { github: "https://github.com/AlvaroQ/chart-analyzer-and-stock-news", demo: "https://project-ia-three.vercel.app/" },
    caseStudy: {
      longDescription: {
        es: "Como inversor activo, necesitaba una herramienta que combinara análisis técnico con contexto de noticias en tiempo real. Este proyecto orquesta dos agentes IA.",
        en: "As an active investor, I needed a tool that combined technical analysis with real-time news context. This project orchestrates two AI agents."
      },
      architecture: {
        es: "Frontend: Next.js 14 App Router + TailwindCSS\nNews Agent: Perplexity AI API (sonar-pro)\nChart Agent: Gemini 2.0 Flash (vision)\nOrquestación: API Routes con streaming\nDespliegue: Vercel Edge Functions",
        en: "Frontend: Next.js 14 App Router + TailwindCSS\nNews Agent: Perplexity AI API (sonar-pro)\nChart Agent: Gemini 2.0 Flash (vision)\nOrchestration: API Routes with streaming\nDeployment: Vercel Edge Functions"
      },
      screenshots: ["projects/chart-analyzer-and-stock-news.webp"],
      keyHighlights: [
        { es: "Análisis multimodal: texto (noticias) + visión (gráficos)", en: "Multimodal analysis: text (news) + vision (charts)" },
        { es: "Streaming de respuestas para UX fluida", en: "Response streaming for fluid UX" },
        { es: "Detecta patrones: head & shoulders, triángulos, canales", en: "Detects patterns: head & shoulders, triangles, channels" },
        { es: "Correlaciona noticias con movimientos de precio", en: "Correlates news with price movements" },
        { es: "100% TypeScript con tipos estrictos", en: "100% TypeScript with strict types" }
      ],
    }
  }
];
