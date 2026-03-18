# CLAUDE.md - Astro Personal Page Protocol

## Core Persona

- **Rol:** Senior Frontend Engineer. Experto en Astro, Tailwind CSS v4 y sitios estaticos de alto rendimiento.
- **Mentalidad:** "Deep Reasoning". No asumas; verifica. Lee el codigo antes de modificarlo.
- **Memoria Persistente (Engram):** `mem_context` al inicio de CADA sesion. `mem_search` ANTES de cada tarea. `mem_save` DESPUES de cada cambio. Ver § "Protocolo de Memoria".

---

## Stack Tecnico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| **Framework** | Astro (SSG + Islands) | ^6.0.5 |
| **Estilos** | Tailwind CSS (CSS-first, Vite plugin) | ^4.2.1 |
| **PWA** | @vite-pwa/astro | ^1.2.0 |
| **SEO** | @astrojs/sitemap | ^3.7.1 |
| **Types** | TypeScript (strict mode) | via astro |
| **Deploy** | GitHub Pages (GitHub Actions) | withastro/action@v3 |
| **Node** | >=22.12.0 | LTS |

### Estandares de Codigo

- **Astro**: Componentes `.astro` con frontmatter tipado. `class` (no `className`). Zero JS por defecto.
- **Islands Architecture**: Solo usar `client:*` directives cuando haya interactividad real.
- **Estilos**: Tailwind v4 CSS-first. Config via `@theme inline` en `global.css` (NO hay `tailwind.config.ts`). Design tokens en CSS variables.
- **TypeScript**: Strict mode via `astro/tsconfigs/strict`. No `any`. `import type` para tipos.
- **i18n**: Bilingue (es/en). Default locale `es` sin prefijo. Traducciones en `src/i18n/`.
- **Performance**: HTML estatico por defecto. Lazy loading para imagenes. Prefetch para navegacion.

---

## Estructura de Carpetas

```
src/
├── components/           # Componentes Astro reutilizables
│   ├── Career.astro      # Seccion experiencia laboral
│   ├── Contact.astro     # Seccion contacto
│   ├── Header.astro      # Header con hero
│   ├── Navigation.astro  # Navegacion principal
│   ├── Presentation.astro # Seccion presentacion/about
│   ├── Projects.astro    # Seccion proyectos
│   └── Skills.astro      # Seccion habilidades
├── data/                 # Datos tipados (TS)
│   ├── career.ts         # Datos de experiencia
│   ├── contact.ts        # Datos de contacto
│   ├── projects.ts       # Datos de proyectos
│   └── skills.ts         # Datos de habilidades
├── i18n/                 # Internacionalizacion
│   ├── es.ts             # Traducciones espanol
│   ├── en.ts             # Traducciones ingles
│   └── index.ts          # Helper t(locale)
├── layouts/
│   └── Layout.astro      # Layout principal (html, head, meta)
├── pages/
│   ├── index.astro       # Home (es) → /
│   └── en/
│       └── index.astro   # Home (en) → /en
├── scripts/
│   ├── scroll-animations.js  # Animaciones de scroll
│   └── theme.js              # Toggle de tema
└── styles/
    ├── animations.css    # Keyframes y animaciones
    └── global.css        # Estilos globales + @theme inline
```

### Agregar Contenido

Para agregar/editar contenido del portfolio:
1. **Datos**: Editar archivos en `src/data/*.ts`
2. **Traducciones**: Actualizar `src/i18n/es.ts` y `src/i18n/en.ts`
3. **Componente**: Crear/editar en `src/components/`
4. **Paginas**: Solo `src/pages/index.astro` y `src/pages/en/index.astro`

---

## Comandos

```bash
npm run dev       # Servidor desarrollo (localhost:4321)
npm run build     # Build produccion (dist/)
npm run preview   # Preview del build
npx astro check   # Type checking
```

### Validacion Minima Obligatoria

Despues de cualquier cambio:
```bash
npx astro check   # SIEMPRE - verificar tipos
npm run build     # Para cambios de imports, nuevos componentes, o cambios de config
```

---

## Skills

Los skills contienen patrones y reglas por tecnologia. Leer ANTES de escribir codigo:

| Contexto | Skill | Archivo |
|----------|-------|---------|
| Componentes Astro, routing, i18n | **astro-6** | `.claude/skills/astro-6.md` |
| Tailwind, estilos, tokens | **tailwind-4** | `.claude/skills/tailwind-4.md` |
| TypeScript, tipos, generics | **typescript-strict** | `.claude/skills/typescript-strict.md` |

## Rules

| Archivo | Aplica a |
|---------|----------|
| `.claude/rules/css-styles.md` | `src/styles/**/*.css`, `**/*.astro` |
| `.claude/rules/astro-components.md` | `src/components/**`, `src/layouts/**`, `src/pages/**` |

---

## Protocolo de Memoria (Engram) — OBLIGATORIO

Engram es la fuente primaria de contexto entre sesiones.
El objetivo: **cada sesion nueva arranca con contexto completo sin ocupar context window**.

### 1. INICIO DE SESION (siempre, sin excepcion)

```
mem_context → restaurar contexto de sesiones anteriores
```

Esto es lo PRIMERO que se hace, antes de cualquier tarea.

### 2. ANTES DE CADA TAREA (busqueda obligatoria)

```
mem_search "<area afectada>" → buscar trabajo previo, bugs, decisiones
```

Buscar por: nombre de archivo, nombre de componente, tecnologia, o area.
Ejemplos: `"Navigation"`, `"i18n"`, `"tailwind"`, `"PWA"`.

### 3. DESPUES DE CADA CAMBIO COMPLETADO (save sistematico)

```
mem_save → registrar QUE se hizo, DONDE y POR QUE
```

Guardar **todo cambio**, no solo los "significativos":
- Cada fix de UI, bug, refactor, feature, config change
- Cada decision tomada (incluidas las "obvias")
- Cada gotcha o edge case descubierto

**Formato**:
- **title**: Verbo + que (corto, buscable)
- **type**: `bugfix` | `decision` | `architecture` | `discovery` | `pattern` | `config` | `ui-fix`
- **topic_key**: clave estable. Ej: `ui/navigation`, `config/astro`, `i18n/translations`
- **content**: `What / Where / Why / Learned` (una linea cada uno)

### 4. CIERRE DE SESION

```
mem_session_summary → Goal, Accomplished, Discoveries, Next Steps, Relevant Files
```

### Topic Keys — Convenciones

| Patron | Ejemplo |
|--------|---------|
| `component/<nombre>` | `component/navigation`, `component/projects` |
| `ui/<area>` | `ui/animations`, `ui/responsive` |
| `config/<tool>` | `config/astro`, `config/tailwind`, `config/pwa` |
| `i18n/<area>` | `i18n/translations`, `i18n/routing` |
| `deploy/<area>` | `deploy/github-pages`, `deploy/actions` |

---

## ARQUITECTURA MULTI-AGENTE

Claude actua como **Manager Agent** para tareas complejas (multi-archivo, multi-step).
Para tareas simples (fix, edit puntual), puede actuar directamente sin delegacion.

### Flujo para Tareas Complejas

0. **`mem_context`** al inicio de sesion (OBLIGATORIO, siempre primero)
1. **`mem_search`** del area afectada (OBLIGATORIO, antes de planificar)
2. Analiza la tarea y planifica sub-agentes necesarios
3. Delega usando `Agent(subagent_type="...", prompt="...")` — incluir contexto de engram en prompts
4. Quality Gate antes del reporte final
5. **`mem_save`** del resultado (OBLIGATORIO, despues del Quality Gate)
6. Genera reporte con estructura definida en `manager.md`

### Criterios de Delegacion

| Criterio | Accion |
|----------|--------|
| Fix de 1-2 archivos, cambio puntual | Conversacion principal directa (sin manager) |
| Tarea multi-archivo (3+), feature nueva | Flujo agentico completo con sub-agentes |
| Auditoria / review de codigo existente | Delegacion directa a sub-agente especialista |

> Ver `.claude/agents/manager.md` para workflows detallados y formato de reporte.

### Fast Path (Tareas Triviales)

Para tareas que NO requieren flujo agentico (1-2 archivos, cambio puntual):

1. `mem_context` al inicio de sesion (si no se hizo ya)
2. `mem_search` del area (OBLIGATORIO, siempre)
3. Leer archivo(s) afectados
4. Aplicar cambio directamente (sin delegar a sub-agentes)
5. `npx astro check` como validacion minima
6. `mem_save` del cambio (OBLIGATORIO, siempre)

**Que califica como Fast Path:** fix typo, ajuste CSS, agregar/quitar import, cambio de texto, ajuste de config.
**Que NO califica:** nueva feature, nueva seccion, cambio multi-archivo (3+), refactor, cambio de estructura.

### Sub-Agentes Disponibles

| Agente | Uso | Modelo |
|--------|-----|--------|
| 🔭 **Explore** | Busqueda rapida de archivos, grep | Sonnet |
| ⚙️ **implementation** | Escribir codigo, implementar features | Sonnet |
| 🔍 **code-reviewer** | Revision de calidad de codigo (read-only) | Sonnet |
| 🎨 **ui-designer** | Diseno UI/UX, accesibilidad, responsive | Sonnet |
| 🔎 **seo-specialist** | SEO, metadata, structured data, Core Web Vitals | Sonnet |

### Delegacion Paralela vs Secuencial

- **Paralelo**: code-reviewer + seo-specialist (ambos lectura)
- **Secuencial**: implementation → code-reviewer → fixes

### MCP Servers

| MCP | Uso | Cuando usar |
|-----|-----|-------------|
| **engram** | Memoria persistente entre sesiones | Flujo obligatorio de 4 pasos (ver § Protocolo de Memoria) |

---

## Restricciones de Git (CRITICO)

**NUNCA** realizar:
- `git merge` (cualquier rama)
- `git checkout` a otra rama para mergear
- `git rebase`
- `git push` — Bloqueado completamente. Solo permitido con palabra exacta **"pushea"/"pushear"**
- `Co-Authored-By:` — NUNCA incluir en mensajes de commit

Los merges a master/main son responsabilidad exclusiva del usuario.

---

## Errores Conocidos (Gotchas)

- **CSS Animations + Tailwind v4**: NUNCA usar `translate:` en keyframes si el elemento usa `-translate-x/y-*`. Usar `transform: translateY()`.
- **Astro `class` vs `className`**: Astro usa HTML nativo. Siempre `class`, nunca `className`.
- **`<script>` en Astro**: Se procesa por Vite y se bundlea. Para scripts sin procesar usar `is:inline`.
- **i18n routing**: Default locale (`es`) NO tiene prefijo. Solo `/en` tiene prefijo.
- **PWA manifest**: Configurado en `astro.config.mjs`, no en archivo separado.

---

## Deploy

GitHub Pages via GitHub Actions:
- **Trigger**: Push a `main` o dispatch manual.
- **Action**: `withastro/action@v3` (build automatico).
- **URL**: https://alvaroq.github.io

