# Take-home — Senior Frontend Engineer (SvelteKit)

## Stack

SvelteKit 2 / Svelte 5 (runes) · TypeScript (strict) · Tailwind CSS 3 (semantic tokens) ·
Zod · Vitest · Playwright + axe-core · Vercel adapter.

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
```

## Tests

```bash
npm run test:unit     # Vitest
npm run test:e2e      # Playwright (builds + serves first)
npm run test          # both
```

## Quality gates (same as CI)

```bash
npm run lint
npm run format:check
npm run check          # svelte-check
npm run typecheck      # tsc --noEmit
npm run build
npm run size            # bundle budget (size-limit)
npm run lhci             # Lighthouse CI (requires a production build)
```

`npm run prepare` (runs automatically on `npm install`) sets up the Husky
pre-commit hook, which runs `lint-staged` (ESLint + Prettier on staged files)
before every commit.

## Demo credentials (once auth lands)

All three accounts use password `demo1234`:

- `admin@demo.test` — full access
- `editor@demo.test` — can edit dashboard rows
- `viewer@demo.test` — read-only

## Architecture notes

- **Rendering**: rendering strategy is chosen per-route deliberately (see commit
  history / ADR notes as routes land) rather than a single global default.
- **Runtime split**: default runtime is Node (`nodejs20.x` on Vercel) for routes
  needing local `fs` access to the mocks or Node `crypto` for session signing
  (`/login`, `/dashboard/items`). The dynamic OG image route runs on the edge
  runtime (`@vercel/og`) once built.
- **State**: component-local state uses Svelte 5 runes (`$state`/`$derived`);
  cross-cutting UI state lives in runes-based `.svelte.ts` modules; anything
  shareable (search/filter/sort/pagination) lives in the URL, read server-side
  in `load` — not in client state.
- **Design tokens**: semantic Tailwind tokens (`bg-surface`, `text-fg`,
  `bg-accent`, etc.) map to CSS variables in `src/lib/styles/tokens.css`, themed
  via `[data-theme="dark"]` — no raw palette classes in components, no parallel
  light/dark class lists.

## Status

Scaffold stage: tooling, CI, and design tokens are wired and green. Routes,
data layer, and components land next — see commit history for progress.
