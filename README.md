# Take-home — Senior Frontend Engineer (SvelteKit)

## Stack

SvelteKit 2 / Svelte 5 (runes) · TypeScript (strict) · Tailwind CSS 3 (semantic tokens) ·
Zod · Vitest · Playwright + axe-core · Vercel adapter (Node + Edge split).

**Live URL:** https://take-home-senior-frontend-sveltekit.vercel.app
**Repo:** https://github.com/jovejob/take-home-senior-frontend-sveltekit

## Getting started

```bash
npm install
cp .env.example .env   # then set SESSION_SECRET — generate with: openssl rand -base64 32
npm run dev             # http://localhost:5173
```

## Tests

```bash
npm run test:unit     # Vitest — 28 tests
npm run test:e2e      # Playwright — builds + serves first
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
npm run lhci             # Lighthouse CI against real routes
```

`npm run prepare` (runs automatically on `npm install`) sets up the Husky
pre-commit hook, which runs `lint-staged` before every commit.

## Demo credentials

Visit `/en/login` (or `/de/login`). All three accounts use password `demo1234`:

- `admin@demo.test` — full access
- `editor@demo.test` — can edit dashboard rows
- `viewer@demo.test` — read-only

## Architecture decisions

**Rendering, chosen per route:**

- `/` — SSG (prerendered). Zero dynamic state, ideal static candidate.
- `/blog` — SSR. Tag/page filters live in the URL, which prerendering can't serve as static files for arbitrary query combinations.
- `/blog/[slug]` — SSG (prerendered). Static per slug×locale, includes JSON-LD `Article` + breadcrumbs, OG/Twitter tags, hreflang, canonical.
- `/search` — SSR via a single native `<form method="GET">` (progressive enhancement baseline — works without JS, SvelteKit auto-intercepts as client-side nav when JS is available).
- `/login`, `/dashboard`, `/dashboard/items` — SSR on Node (session signing, mock-data reads).
- `/dashboard/items` specifically streams its data (`load` returns an unawaited promise), rendering a skeleton immediately.
- `/en/blog/[slug]/og` (dynamic OG image generation) — dynamic on Node. Originally built for the edge runtime, but `@vercel/og` statically references a font asset that `adapter-vercel`'s edge bundler can't resolve for SvelteKit (it assumes Next.js's build pipeline) — a documented cross-framework incompatibility. Prerendering was tried next but broke `Content-Type` for the extensionless route (browser downloaded instead of rendering inline). Plain dynamic Node avoids both problems.
- `/{locale}/logout` — **edge runtime**, satisfying the brief's edge-route requirement. Trivial logic (delete a cookie, redirect), zero Node-specific dependencies in its chain — session verification uses the Web Crypto API (`crypto.subtle`), not `node:crypto`, specifically so it's portable to edge.

**State management:** Svelte 5 runes only. Component-local state via `$state`/`$derived`; cross-cutting UI state (toasts) via a runes-based class in a `.svelte.ts` module; anything shareable/bookmarkable (dashboard filters, search, pagination) lives in the URL, never in client state.

**Data layer:** Zod schemas (`src/lib/server/schemas/`) are the single source of truth, translated from `mocks/schemas.json`, validated at the boundary on module load. Query logic (`query-items.ts`, `query-posts.ts`) is deliberately pure and I/O-free — takes an array, returns paginated/filtered/sorted results — separated from the repository layer that loads and validates the actual JSON, so the logic is unit-testable with small fixtures instead of the full 220-row dataset.

**Auth:** Signed session cookie (HMAC-SHA256 via Web Crypto), `httpOnly`/`sameSite=lax`, verified in a global `hooks.server.ts` that guards `/dashboard/*`. Passwords are plaintext-compared server-side per the mock data's own README (never client-side), isolated in one function so swapping in real hashing later touches no callers.

**Dashboard optimistic edit:** Status changes apply to the UI immediately, then submit via a form action. On success, `invalidate('app:items')` refetches just that route's data. On failure (~20% simulated, since there's no real backend to fail against), the UI rolls back to the previous value and shows both an inline error and a toast. The rollback path is tested deterministically in Playwright via `page.route()` interception, not the random chance.

**Design system:** 9 primitives (`Button`, `Card`, `Badge`, `Input`, `Select`, `Container`, `Heading`, `Toast`+store) plus `Dialog` as the required complex composite — built from scratch (focus trap, ARIA, ESC/backdrop dismissal, focus restoration, scroll lock), used for a genuine sign-out confirmation rather than as a decorative demo.

**Known, deliberate limitations:**

- Lighthouse CI covers `/en` and `/en/blog/[slug]`; `/dashboard/items` is behind auth and out of scope for plain LHCI without a custom authenticated collection script.
- In-memory mutations (dashboard edits) don't persist across serverless cold starts — acceptable for a take-home with no real database; a production version would swap `updateItemStatus` for an actual DB write with no changes needed above that function.
- The dashboard's public nav (added for `/blog`/`/search` reachability) currently stacks visually above the dashboard's own authenticated header — functional, not fully polished.

## Time spent

Approximately **14-16 hours** total, spread across four days (Aug 5-8).

This is based on commit-history analysis (50 commits, ~13.7h of estimated
active work from gaps between commits), plus additional time for planning,
manual testing, and debugging sessions that didn't always produce a commit
in the same stretch — hence the slightly rounded-up range.

**[YOUR ACTUAL HOURS HERE]**

## Anything worth discussing on the call

- The edge-runtime pivot (OG images → `/logout`) and the debugging path that led there
- The rendering-strategy tradeoffs per route
- The optimistic-UI/rollback design and how it's tested deterministically
