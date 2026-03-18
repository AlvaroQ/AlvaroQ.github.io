# Astro 6 — Patrones y Buenas Practicas

## Arquitectura

- **Islands Architecture**: Astro renderiza HTML estatico por defecto. Solo los componentes interactivos necesitan `client:*` directives.
- **Zero JS by default**: No enviar JavaScript al cliente a menos que sea explicitamente necesario.
- **Content-first**: Astro esta optimizado para sitios orientados a contenido (portfolios, blogs, landing pages).

## Componentes Astro (.astro)

### Estructura

```astro
---
// Frontmatter: se ejecuta en el servidor (build time)
import Component from '../components/Component.astro';
import type { Props } from '../types';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Default' } = Astro.props;
const data = await fetchData(); // Async permitido en frontmatter
---

<!-- Template: HTML con expresiones -->
<div class="container">
  <h1>{title}</h1>
  {description && <p>{description}</p>}
  <Component />
</div>

<style>
  /* Scoped por defecto - solo afecta a este componente */
  .container { max-width: 1200px; }
</style>

<script>
  // Se ejecuta en el cliente - se bundlea automaticamente
  document.querySelector('.container')?.addEventListener('click', handler);
</script>
```

### Reglas Clave

1. **Frontmatter** (`---`): Codigo servidor. Imports, data fetching, logica de build.
2. **Template**: HTML con `{expresiones}`. NO JSX completo (no `className`, usar `class`).
3. **`<style>`**: Scoped por defecto. Usar `is:global` para estilos globales.
4. **`<script>`**: Se ejecuta en cliente. Se procesa y bundlea por Vite.
5. **Props**: Definir con `interface Props` o `type Props`. Acceder via `Astro.props`.

## Client Directives (Hidratacion)

```astro
<!-- Hidratar inmediatamente al cargar -->
<InteractiveComponent client:load />

<!-- Hidratar cuando sea visible en viewport -->
<HeavyComponent client:visible />

<!-- Hidratar cuando el browser este idle -->
<LowPriorityComponent client:idle />

<!-- Hidratar solo en ciertos media queries -->
<MobileMenu client:media="(max-width: 768px)" />

<!-- Solo renderizar en el cliente (no SSR) -->
<ClientOnlyWidget client:only="react" />
```

### Cuando usar cada directive

| Directive | Uso |
|-----------|-----|
| `client:load` | Interactividad critica (navegacion, formularios above-the-fold) |
| `client:visible` | Componentes below-the-fold (carousels, mapas) |
| `client:idle` | Baja prioridad (analytics, chat widgets) |
| `client:media` | Solo en ciertos viewports (menu mobile) |
| `client:only` | Sin SSR (componentes que dependen de `window`/`document`) |

## Routing y Pages

```
src/pages/
├── index.astro          → /
├── about.astro          → /about
├── en/
│   └── index.astro      → /en
├── blog/
│   ├── index.astro      → /blog
│   └── [slug].astro     → /blog/:slug (dynamic)
└── [...slug].astro      → catch-all
```

## i18n (Internacionalizacion)

```typescript
// astro.config.mjs
i18n: {
  defaultLocale: 'es',
  locales: ['es', 'en'],
  routing: { prefixDefaultLocale: false }
}

// En componentes:
const currentLocale = Astro.currentLocale; // 'es' | 'en'
```

### Patron de traducciones

```typescript
// src/i18n/index.ts
import es from './es';
import en from './en';

const translations = { es, en };

export function t(locale: string) {
  return translations[locale as keyof typeof translations] ?? translations.es;
}

// Uso en componente:
const i18n = t(Astro.currentLocale ?? 'es');
```

## Data Fetching

```astro
---
// Todo fetch ocurre en build time (SSG) o request time (SSR)
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// Importar datos locales
import { projects } from '../data/projects';
---
```

## Slots (Composicion)

```astro
<!-- Layout.astro -->
<html>
  <head><slot name="head" /></head>
  <body>
    <slot />  <!-- Default slot -->
    <footer><slot name="footer" /></footer>
  </body>
</html>

<!-- Uso -->
<Layout>
  <Fragment slot="head"><title>Mi Pagina</title></Fragment>
  <main>Contenido principal</main>
  <p slot="footer">Footer content</p>
</Layout>
```

## Optimizaciones

- **View Transitions**: `import { ViewTransitions } from 'astro:transitions'` en el `<head>`.
- **Image Optimization**: `import { Image } from 'astro:assets'` para optimizacion automatica.
- **Prefetch**: `<a href="/about" data-astro-prefetch>` para prefetch de paginas.
- **Content Collections**: Para contenido estructurado (blog posts, proyectos).

## Anti-Patrones

- NO usar `client:load` en todo — rompe el beneficio de zero-JS.
- NO usar `className` — Astro usa `class` (es HTML, no JSX).
- NO importar frameworks pesados para interactividad simple — usar `<script>` vanilla.
- NO hacer data fetching en el cliente si se puede hacer en el frontmatter.
- NO usar `is:global` indiscriminadamente — mantener estilos scoped cuando sea posible.
