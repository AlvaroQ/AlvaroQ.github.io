# Tailwind CSS v4 — Patrones y Migracion

## Configuracion CSS-First

Tailwind v4 elimina `tailwind.config.ts`. Toda la configuracion va en CSS:

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme inline {
  --color-primary: #00FFFF;
  --color-background: #0A0A0F;
  --color-surface: #1A1A2E;
  --color-text: #E0E0E0;
  --color-text-muted: #8B8B9E;
  --color-accent: #00FFFF;
  --color-accent-hover: #00E5E5;

  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --breakpoint-xs: 475px;
}
```

## Integracion con Astro + Vite

```javascript
// astro.config.mjs
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  }
});
```

## Migraciones v3 → v4

| v3 | v4 | Notas |
|----|-----|-------|
| `shadow-sm` | `shadow-xs` | Renombrado |
| `shadow` | `shadow-sm` | Renombrado |
| `outline-none` | `outline-hidden` | `outline-none` ahora = `outline-style: none` |
| `flex-shrink-0` | `shrink-0` | Simplificado |
| `flex-grow` | `grow` | Simplificado |
| `bg-gradient-to-r` | `bg-linear-to-r` | Renombrado |
| `!important` prefix | `class!` suffix | `!text-red` → `text-red!` |
| `ring` (3px) | `ring` (1px) | Valor por defecto cambio |

## Reglas de Estilos

1. **NUNCA** usar `var()` en classNames — usar tokens de `@theme inline`.
2. **NUNCA** usar hex/rgb directamente en clases — definir en `@theme`.
3. **NUNCA** usar `cn()` sin logica condicional — si no hay condicion, concatenar strings.
4. **Preferir** utilities de Tailwind sobre CSS custom.
5. **Responsive**: Mobile-first (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`).

## Dark Mode

Tailwind v4 usa `@variant dark` o la clase `dark:` con `prefers-color-scheme` por defecto.

```css
@variant dark (&:where(.dark, .dark *));
```

## CSS Animations con Tailwind v4

```css
/* CORRECTO */
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* INCORRECTO - NUNCA usar translate: en keyframes si el elemento usa -translate-x/y-* */
@keyframes slideUp {
  from { translate: 0 100%; }  /* CONFLICTO con utilidades translate */
}
```

## Container Queries

```css
/* Definir container */
.card-container { container-type: inline-size; container-name: card; }

/* Usar en Tailwind */
@container card (min-width: 400px) {
  .card-content { /* estilos */ }
}
```

## Anti-Patrones

- NO crear `tailwind.config.ts` — toda config en CSS con `@theme inline`.
- NO mezclar utilidades Tailwind con CSS inline — elegir uno.
- NO usar `@apply` excesivamente — preferir utilidades directamente en el template.
- NO usar valores arbitrarios `[valor]` si el token ya existe en `@theme`.
