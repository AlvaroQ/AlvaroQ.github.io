# TypeScript Strict Mode — Patrones

## Configuracion

```json
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict"
}
```

## Reglas Fundamentales

### No `any`

```typescript
// MAL
function process(data: any) { ... }

// BIEN
function process(data: unknown) { ... }
function process(data: Record<string, string>) { ... }
```

### Import Type

```typescript
// Siempre usar import type para tipos
import type { ProjectData } from '../data/projects';

// Para valores + tipos mixtos
import { projects } from '../data/projects';
import type { ProjectData } from '../data/projects';
```

### Interfaces y Types

```typescript
// Preferir interface para objetos
interface Project {
  readonly id: string;
  title: string;
  description: string;
  tags: readonly string[];
  url?: string;
}

// Preferir type para unions y composicion
type Locale = 'es' | 'en';
type Theme = 'light' | 'dark';
```

### Const Assertions

```typescript
// Para valores constantes
const THEMES = ['light', 'dark'] as const;
type Theme = (typeof THEMES)[number]; // 'light' | 'dark'

const ROUTES = {
  home: '/',
  about: '/about',
  projects: '/projects',
} as const;
```

### Narrowing Seguro

```typescript
// Usar type guards
function isProject(item: unknown): item is Project {
  return typeof item === 'object' && item !== null && 'id' in item;
}

// Nullish coalescing y optional chaining
const title = project?.title ?? 'Sin titulo';
```

### Generics

```typescript
// Para funciones reutilizables
function getTranslation<T extends Record<string, string>>(
  translations: T,
  key: keyof T
): string {
  return translations[key];
}
```

## Anti-Patrones

- NO usar `any` — usar `unknown` y narrowing.
- NO usar `as` type assertions salvo en tests o boundaries con APIs externas.
- NO usar `!` non-null assertion — manejar el caso null explicitamente.
- NO re-exportar tipos innecesariamente — importar desde la fuente.
- NO usar `enum` — preferir `as const` + type derivado.
- NO ignorar errores con `@ts-ignore` — usar `@ts-expect-error` con comentario explicativo si es inevitable.
