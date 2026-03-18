---
applies_to:
  - "src/components/**/*.astro"
  - "src/layouts/**/*.astro"
  - "src/pages/**/*.astro"
---

# Reglas de Componentes Astro

## Estructura de Componente

Todo componente `.astro` debe seguir el orden:

1. **Frontmatter** (`---`): Imports, tipos, props, logica servidor.
2. **Template**: HTML con expresiones.
3. **`<style>`**: Estilos scoped (opcional).
4. **`<script>`**: JavaScript cliente (opcional).

## Props

- Definir `interface Props` en el frontmatter.
- Desestructurar con defaults: `const { title, size = 'md' } = Astro.props;`
- Documentar props opcionales con `?`.

## HTML, no JSX

- Usar `class` (NO `className`).
- Usar `for` en labels (NO `htmlFor`).
- Atributos booleanos: `<input disabled />` (no `disabled={true}`).
- Eventos: NO usar `onClick` — usar `<script>` con `addEventListener`.

## Zero JS por Defecto

- NO agregar `client:load` salvo que el componente NECESITE interactividad en el cliente.
- Para interactividad simple (toggles, scroll), preferir `<script>` vanilla.
- Para interactividad compleja (formularios dinamicos), usar framework con `client:visible` o `client:idle`.

## i18n

- Obtener locale: `const locale = Astro.currentLocale ?? 'es';`
- Usar funcion `t(locale)` del modulo `src/i18n/index.ts`.
- Todo texto visible debe ser traducible.

## Layouts

- Usar `<slot />` para composicion.
- Named slots para secciones especificas (`slot="head"`, `slot="footer"`).
- El layout principal (`Layout.astro`) maneja `<html>`, `<head>`, meta tags.

## Performance

- Imagenes: Usar `<img loading="lazy" decoding="async" />` para below-the-fold.
- Fonts: Precargar con `<link rel="preload">` en el layout.
- Scripts: Preferir `<script>` inline sobre imports de librerias pesadas.

## Anti-Patrones

- NO poner logica de negocio en el template — moverla al frontmatter.
- NO importar librerias solo para un efecto simple — usar CSS o vanilla JS.
- NO usar `document.querySelector` sin verificar null.
- NO crear componentes Astro para contenido puramente estatico sin variacion — usar HTML directo.
