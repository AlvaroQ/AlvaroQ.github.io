---
applies_to:
  - "src/styles/**/*.css"
  - "**/*.astro"
---

# Reglas de Estilos CSS + Tailwind v4

## Tailwind v4 CSS-First

- Toda la configuracion en `@theme inline` dentro de `src/styles/global.css`.
- NO existe `tailwind.config.ts` — no crearlo.
- Integracion via `@tailwindcss/vite` plugin en `astro.config.mjs`.

## Tokens de Diseno

- Usar variables de `@theme inline` para colores, fuentes y spacing.
- NUNCA usar `var()` directamente en `class=""` — usar las utilidades generadas por Tailwind.
- NUNCA usar hex/rgb inline en clases.

## Scoped vs Global

- Componentes Astro: `<style>` es scoped por defecto. Aprovecharlo.
- Solo usar `is:global` cuando el estilo DEBE afectar elementos fuera del componente.
- Estilos globales van en `src/styles/global.css`.

## Animaciones

- Definir keyframes en `src/styles/animations.css`.
- NUNCA usar `translate:` en keyframes si el elemento usa clases `-translate-x/y-*`.
- Usar `transform: translateY()` en su lugar.

## Responsive

- Mobile-first: escribir estilos base para mobile, luego `sm:`, `md:`, `lg:`.
- Breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`, `2xl:1536px`.

## Anti-Patrones

- NO usar `@apply` excesivamente — preferir utilidades en el template.
- NO mezclar Tailwind con CSS inline en el mismo elemento.
- NO crear clases custom cuando una utilidad de Tailwind existe.
