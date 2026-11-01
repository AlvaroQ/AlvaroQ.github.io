# alvaroq.github.io

Personal portfolio of Álvaro Quintana — a static, bilingual (es/en) single page built with
[Astro](https://astro.build) 6 and Tailwind CSS 4, deployed to GitHub Pages.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (Node >= 22.18) |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Production build in `dist/` |
| `npm run preview` | Serve the build locally |
| `npm run verify` | `astro check`, build and the `node --test scripts/` checks (same as CI) |
| `npm run assets:icons` | Regenerate favicons and the per-language Open Graph images (needs Chrome) |
| `npm run assets:relief` | Regenerate the hero watermark height map from the portrait |

## Structure

- `src/pages/` — `/` (Spanish, default locale) and `/en/`.
- `src/components/` — one Astro component per section; `Section.astro` wraps each one.
- `src/data/` — typed content: projects, career, skills, sections, SEO and site-wide facts.
- `src/i18n/` — `es.ts` / `en.ts` strings and the `t(lang)` helper.
- `src/lib/` — responsive images through `astro:assets` (sharp at build time).
- `src/scripts/` — client modules: theme, the live-ink hero and the watermark (WebGL).
- `scripts/` — deterministic tests over `dist/`, the image-sizing math, the CSP hash helper,
  the post-build master pruning and the manual asset generators (`scripts/assets/`).

## Content

Edit the data in `src/data/*.ts` and the strings in `src/i18n/es.ts` and `src/i18n/en.ts`
(TypeScript enforces the same keys in both). Images live in `src/assets/` and are served as
WebP variants with `srcset`/`sizes`.

## Deploy

Every push to `main` runs `npm run verify` and publishes `dist/` to GitHub Pages
(`.github/workflows/deploy.yml`).
