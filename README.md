# Stat Selector

Stat Selector is a Vite + React application that guides students and analysts toward an appropriate statistical test by walking them through a short decision wizard. The UI currently ships with Czech copy, but all question wording, decision rules, and result details are configurable through JSON files.

## Features
- Guided wizard that captures number of samples, measurement focus, and normality assumptions, then recommends a matching statistical test.
- Config-driven decision rules (`config/tests.json`) that can be updated without touching application code.
- Rich result view with Czech-language descriptions, null/alternative hypotheses, usage notes, and ready-to-run Python snippets sourced from `config/test-details.json`.
- Read-only configuration viewer at `/config` that can reload, download, or locally preview alternative configuration files.
- Zustand state management + React Query for predictable wizard state, caching, and future data integrations.
- Tailwind + shadcn/ui component library for consistent styling, accessibility, and dark-ready theming.

## Quick Start
```sh
# install dependencies
npm install

# start the development server
npm run dev

# build for production
npm run build

# preview the production build
npm run preview

# lint source files
npm run lint

# run unit tests (Vitest)
npx vitest
```
Vite targets modern browsers; use Node.js 18+ (or Bun with `bun install` / `bun dev`) for local development.

## Project Structure
- `src/main.tsx` / `src/App.tsx` – application entry, router, and global providers (React Query, tooltips, toasts).
- `src/features/wizard` – multi-step selection flow, Zustand store, and application of rules to produce a recommendation.
- `src/features/config` – read-only configuration viewer with reload, download, and local upload helpers.
- `src/lib` – configuration service, rules engine, Zod schemas, shared types, utilities, and unit tests.
- `src/components` – reusable presentation components (stepper, selection cards, info bubble, navigation, shadcn primitives).
- `config/` – JSON configuration that powers the wizard and result details, plus supporting assumptions documentation.
- `public/` – static assets served by Vite (the JSON configs are fetched from `/config/...` at runtime).

## Configuration Model
| File | Purpose |
| --- | --- |
| `config/ui.json` | Defines wizard steps, option labels, and per-sample branching. Update this to change questions or add steps. |
| `config/tests.json` | Maps user selections to recommended tests. Rules support partial matches; the most specific match wins. |
| `config/test-details.json` | Supplies localized descriptions, hypotheses, Python snippets, and optional alternative hypotheses for each test id. |
| `config/assumptions.md` | Human-readable notes about assumptions and reporting conventions for each statistical test. |

After editing any of these files, reload the configuration inside the running app from the `/config` page or refresh the browser. The wizard fetches the JSON on demand, so no rebuild is required while the dev server is running.

## Testing and Quality
- Unit tests live under `src/lib/__tests__` and currently cover the rules engine logic. Run them with `npx vitest`.
- ESLint enforces the project’s TypeScript, React, and shadcn-ui conventions (`npm run lint`).
- Tailwind and shadcn/ui components are preconfigured for responsive, accessible UI; follow existing patterns when adding new screens.

## Localization
All copy in the default configuration is Czech. To translate the experience, duplicate the JSON files, update labels and descriptions, and point the UI to the variant of your choice. Because the wizard reads its content from JSON, no code changes are necessary to support alternate languages or domain-specific paths.

## Deployment
`npm run build` outputs static assets to `dist/`, suitable for any static hosting provider (Vercel, Netlify, GitHub Pages). The build bundles the `/config` directory alongside the site; keep configuration files in the `public/config` path when deploying so the runtime fetches continue to succeed.
