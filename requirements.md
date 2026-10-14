# FitBox Requirements

This file is the Markdown version of the project requirements analysis. It was
prepared by reviewing the project folders `public`, `scripts`, `src`, and
`supabase`, plus the root project files such as `.env`, `.gitignore`,
`bun.lockb`, `components.json`, `eslint-report.txt`, `eslint.config.js`,
`index.html`, `package-lock.json`, `package.json`,
`postcss.config.js`, `README.md`, `tailwind.config.ts`, the TypeScript
configs, `vercel.json`, `VERCEL_DEPLOYMENT.md`, `vite.config.ts`,
`FitBox_PRD.md`, and `FitBox_Synopsis.md`.

## Python Requirements

There are no Python source files, notebooks, Python lock files, Python package
manifests, or Python import statements in this project. `requirements.txt` is
therefore intentionally comments-only and safe for Python tooling to consume.

Use Node/npm for this repository:

```sh
npm install
npm run dev
npm run build
```

## Runtime Requirements

- Node.js and npm for the Vite React application and local scripts.
- Supabase project for authentication, database, storage, realtime, and Edge
  Functions.
- Supabase CLI or dashboard workflow for applying migrations under
  `supabase/migrations`.
- Vercel or another static hosting platform capable of serving the Vite build
  output from `dist`.
- Deno runtime for Supabase Edge Functions. Supabase normally provides this
  runtime; it is not installed through npm or pip.

No Node engine is declared in `package.json`, so this project does not currently
pin a specific Node.js version in its manifest.

## Environment Variables

The values below are required by code or deployment docs. Secret values from
`.env` were not copied into this file.

### Frontend Vite App

- `VITE_SUPABASE_URL` - required by `src/lib/env.ts`.
- `VITE_SUPABASE_PUBLISHABLE_KEY` - required by `src/lib/env.ts`.
- `VITE_SUPABASE_PROJECT_ID` - declared as optional in `src/vite-env.d.ts`.

### Media Upload Script

- `VITE_SUPABASE_URL` - used by `scripts/upload-exercise-media.mjs`.
- `SUPABASE_SERVICE_ROLE_KEY` - used by `scripts/upload-exercise-media.mjs`.

### Supabase Edge Functions

- `LOVABLE_API_KEY` - used by `supabase/functions/fitness-chat/index.ts`.
- `GEMINI_API_KEY` - used by `supabase/functions/project-assistant/index.ts`
  (direct `generativelanguage.googleapis.com` call, not the Lovable gateway).
- `SUPABASE_URL` - used by
  `supabase/functions/get-trainer-contact/index.ts`.
- `SUPABASE_ANON_KEY` - used by
  `supabase/functions/get-trainer-contact/index.ts`.
- `SUPABASE_SERVICE_ROLE_KEY` - used by
  `supabase/functions/get-trainer-contact/index.ts`.

## npm Runtime Dependencies

These come from `package.json` dependencies and are also reflected by imports in
`src`, `scripts`, or Supabase-adjacent code where applicable.

| Package | Version range |
| --- | --- |
| `@hookform/resolvers` | `^3.10.0` |
| `@radix-ui/react-accordion` | `^1.2.11` |
| `@radix-ui/react-alert-dialog` | `^1.1.14` |
| `@radix-ui/react-aspect-ratio` | `^1.1.7` |
| `@radix-ui/react-avatar` | `^1.1.10` |
| `@radix-ui/react-checkbox` | `^1.3.2` |
| `@radix-ui/react-collapsible` | `^1.1.11` |
| `@radix-ui/react-context-menu` | `^2.2.15` |
| `@radix-ui/react-dialog` | `^1.1.14` |
| `@radix-ui/react-dropdown-menu` | `^2.1.15` |
| `@radix-ui/react-hover-card` | `^1.1.14` |
| `@radix-ui/react-label` | `^2.1.7` |
| `@radix-ui/react-menubar` | `^1.1.15` |
| `@radix-ui/react-navigation-menu` | `^1.2.13` |
| `@radix-ui/react-popover` | `^1.1.14` |
| `@radix-ui/react-progress` | `^1.1.7` |
| `@radix-ui/react-radio-group` | `^1.3.7` |
| `@radix-ui/react-scroll-area` | `^1.2.9` |
| `@radix-ui/react-select` | `^2.2.5` |
| `@radix-ui/react-separator` | `^1.1.7` |
| `@radix-ui/react-slider` | `^1.3.5` |
| `@radix-ui/react-slot` | `^1.2.3` |
| `@radix-ui/react-switch` | `^1.2.5` |
| `@radix-ui/react-tabs` | `^1.1.12` |
| `@radix-ui/react-toast` | `^1.2.14` |
| `@radix-ui/react-toggle` | `^1.1.9` |
| `@radix-ui/react-toggle-group` | `^1.1.10` |
| `@radix-ui/react-tooltip` | `^1.2.7` |
| `@supabase/supabase-js` | `^2.58.0` |
| `@tanstack/react-query` | `^5.83.0` |
| `class-variance-authority` | `^0.7.1` |
| `clsx` | `^2.1.1` |
| `cmdk` | `^1.1.1` |
| `date-fns` | `^3.6.0` |
| `embla-carousel-react` | `^8.6.0` |
| `input-otp` | `^1.4.2` |
| `lucide-react` | `^0.462.0` |
| `next-themes` | `^0.3.0` |
| `react` | `^18.3.1` |
| `react-day-picker` | `^8.10.1` |
| `react-dom` | `^18.3.1` |
| `react-hook-form` | `^7.61.1` |
| `react-resizable-panels` | `^2.1.9` |
| `react-router-dom` | `^6.30.1` |
| `recharts` | `^2.15.4` |
| `sonner` | `^1.7.4` |
| `tailwind-merge` | `^2.6.0` |
| `tailwindcss-animate` | `^1.0.7` |
| `vaul` | `^0.9.9` |
| `zod` | `^3.25.76` |

## npm Development Dependencies

| Package | Version range |
| --- | --- |
| `@eslint/js` | `^9.32.0` |
| `@tailwindcss/typography` | `^0.5.16` |
| `@types/node` | `^22.16.5` |
| `@types/react` | `^18.3.23` |
| `@types/react-dom` | `^18.3.7` |
| `@vitejs/plugin-react-swc` | `^3.11.0` |
| `autoprefixer` | `^10.4.21` |
| `eslint` | `^9.32.0` |
| `eslint-plugin-react-hooks` | `^5.2.0` |
| `eslint-plugin-react-refresh` | `^0.4.20` |
| `globals` | `^15.15.0` |
| `lovable-tagger` | `^1.1.10` |
| `postcss` | `^8.5.6` |
| `tailwindcss` | `^3.4.17` |
| `typescript` | `^5.8.3` |
| `typescript-eslint` | `^8.38.0` |
| `vite` | `^5.4.19` |

## Supabase Edge Function URL Imports

Supabase Edge Functions import these remote modules directly in Deno:

| Import | Used by |
| --- | --- |
| `https://deno.land/std@0.168.0/http/server.ts` | `fitness-chat`, `project-assistant`, `get-trainer-contact` |
| `https://esm.sh/@supabase/supabase-js@2` | `get-trainer-contact` |

## Native and Local Imports

The `scripts/` tooling (`upload-exercise-media.mjs` and
`build-project-knowledge.mjs`) uses Node built-ins only:

- `node:fs/promises`
- `node:path`
- `node:url`

The app uses the `@/*` TypeScript/Vite path alias configured in
`tsconfig.json`, `tsconfig.app.json`, and `vite.config.ts`.

## Static Assets and Archive Notes

- `public` contains favicons, `robots.txt`, preview imagery, preset images, and
  exercise demo videos.
- `src/assets` contains app images used by React components.
- `*.zip` archives are gitignored (`.gitignore`); exported mockup zips are
  not part of the committed repository.

## Lock and Tooling Files

- `package-lock.json` is the npm lockfile and should be committed with
  `package.json`.
- `bun.lockb` is present, but npm scripts and docs use npm commands.
- `components.json` configures shadcn/ui aliases and Tailwind integration.
- `eslint.config.js` configures ESLint, TypeScript ESLint, React Hooks, and React
  Refresh rules.
- `tailwind.config.ts` and `postcss.config.js` configure Tailwind CSS,
  `tailwindcss-animate`, and Autoprefixer.
- `vercel.json` rewrites SPA routes to `index.html`.
- `supabase/config.toml` registers the `fitness-chat`, `project-assistant`,
  and `get-trainer-contact` edge functions, each with `verify_jwt = true`.
- `supabase/.temp/` (Supabase CLI local state) is gitignored.

## Install Summary

Use this command for project dependencies:

```sh
npm install
```

Do not add npm packages to `requirements.txt`. If Python code is added later,
only then should pip dependencies be listed in `requirements.txt`.


---

## Detailed Dependency Directory & Documentation Links

The following table documents the essential dependencies driving FitBox, including pinned version ranges, architectural roles within the application, and links to official documentation for contributor reference:

### Production Runtime Dependencies

| Package Name | Version Range | Documentation | Role & Project Purpose |
| :--- | :--- | :--- | :--- |
| **`react`** | `^18.3.1` | [React Docs](https://react.dev/) | Core UI library powering component lifecycle, Hooks, and concurrent rendering. |
| **`react-dom`** | `^18.3.1` | [ReactDOM Docs](https://react.dev/reference/react-dom) | DOM rendering engine for the React component hierarchy. |
| **`react-router-dom`** | `^6.30.1` | [React Router Docs](https://reactrouter.com/en/v6) | Declarative client-side SPA routing across 17 distinct application routes. |
| **`@tanstack/react-query`** | `^5.83.0` | [TanStack Query Docs](https://tanstack.com/query/latest) | Asynchronous server-state synchronization, background caching, and optimistic mutations. |
| **`@supabase/supabase-js`** | `^2.58.0` | [Supabase JS Docs](https://supabase.com/docs/reference/javascript/introduction) | Official client for Supabase PostgreSQL, Authentication, Realtime WebSockets, and Storage. |
| **`zod`** | `^3.25.76` | [Zod Docs](https://zod.dev/) | TypeScript-first schema declaration and runtime validation for auth and onboarding. |
| **`react-hook-form`** | `^7.61.1` | [React Hook Form Docs](https://react-hook-form.com/) | High-performance, un-opinionated form state management with minimal re-renders. |
| **`@hookform/resolvers`** | `^3.10.0` | [Resolvers Docs](https://github.com/react-hook-form/resolvers) | Seamless integration bridge connecting Zod validation schemas with React Hook Form. |
| **`lucide-react`** | `^0.462.0` | [Lucide Docs](https://lucide.dev/) | Clean, customizable SVG icon library optimized for tree-shaking. |
| **`recharts`** | `^2.15.4` | [Recharts Docs](https://recharts.org/) | Composable D3-based SVG charting library powering GymBuddy compatibility radar and macro graphs. |
| **`vaul`** | `^0.9.9` | [Vaul Docs](https://vaul.emilkowal.ski/) | Smooth, drawer primitive for mobile fitness workouts and exercise selectors. |
| **`sonner`** | `^1.7.4` | [Sonner Docs](https://sonner.emilkowal.ski/) | Opinionated toast notification component for user feedback and alert triggers. |
| **`class-variance-authority`** | `^0.7.1` | [CVA Docs](https://cva.style/docs) | Utility for constructing typed, variant-driven UI component styles. |
| **`clsx`** | `^2.1.1` | [clsx Docs](https://github.com/lukeed/clsx) | Fast utility for conditionally joining CSS class names together. |
| **`tailwind-merge`** | `^2.6.0` | [tailwind-merge Docs](https://github.com/dcastil/tailwind-merge) | Utility to merge conflicting Tailwind CSS classes without stylesheet specificity bugs. |
| **`date-fns`** | `^3.6.0` | [date-fns Docs](https://date-fns.org/) | Modern JavaScript date utility library for streak calculations and session scheduling. |
| **`cmdk`** | `^1.1.1` | [cmdk Docs](https://cmdk.paco.me/) | Fast, accessible command menu primitive for exercise search and filter palettes. |
| **`embla-carousel-react`** | `^8.6.0` | [Embla Docs](https://www.embla-carousel.com/) | Lightweight carousel library for onboarding inspiration carousels and exercise galleries. |

### Radix UI Accessible Primitives (`@radix-ui/*`)

FitBox utilizes unstyled, accessible UI primitives from Radix UI to construct shadcn/ui components:

| Package | Version | Documentation | Purpose |
| :--- | :--- | :--- | :--- |
| `@radix-ui/react-dialog` | `^1.1.14` | [Dialog Docs](https://www.radix-ui.com/primitives/docs/components/dialog) | Accessible modal dialogs for exercise previews and gym partner overlays. |
| `@radix-ui/react-dropdown-menu` | `^2.1.15` | [Dropdown Docs](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) | User profile actions and contextual navigation menus. |
| `@radix-ui/react-tabs` | `^1.1.12` | [Tabs Docs](https://www.radix-ui.com/primitives/docs/components/tabs) | Tabbed navigation for front/back body diagram and nutrition breakdown. |
| `@radix-ui/react-slider` | `^1.3.5` | [Slider Docs](https://www.radix-ui.com/primitives/docs/components/slider) | GymBuddy radar search radius control (2km–30km). |
| `@radix-ui/react-tooltip` | `^1.2.7` | [Tooltip Docs](https://www.radix-ui.com/primitives/docs/components/tooltip) | Hover descriptions for muscle anatomy and macro abbreviations. |
| `@radix-ui/react-switch` | `^1.2.5` | [Switch Docs](https://www.radix-ui.com/primitives/docs/components/switch) | Toggles for GymBuddy discoverability and gender view selection. |
| `@radix-ui/react-accordion` | `^1.2.11` | [Accordion Docs](https://www.radix-ui.com/primitives/docs/components/accordion) | Expandable FAQ items and workout exercise details. |
| `@radix-ui/react-avatar` | `^1.1.10` | [Avatar Docs](https://www.radix-ui.com/primitives/docs/components/avatar) | User avatar thumbnails with fallback monogram generation. |
| `@radix-ui/react-progress` | `^1.1.7` | [Progress Docs](https://www.radix-ui.com/primitives/docs/components/progress) | Workout session completion bars and daily macro targets. |

### Development, Compilation & Quality Tooling

| Tool Name | Version Range | Documentation | Purpose |
| :--- | :--- | :--- | :--- |
| **`vite`** | `^5.4.19` | [Vite Docs](https://vitejs.dev/) | High-speed frontend build tool and dev server featuring ESM and HMR. |
| **`typescript`** | `^5.8.3` | [TypeScript Docs](https://www.typescriptlang.org/) | Static type checker providing robust interfaces across frontend and data models. |
| **`@vitejs/plugin-react-swc`**| `^3.11.0` | [Plugin SWC Docs](https://github.com/vitejs/vite-plugin-react-swc) | Ultra-fast SWC compiler plugin for React Fast Refresh and JSX transformation. |
| **`tailwindcss`** | `^3.4.17` | [Tailwind CSS Docs](https://tailwindcss.com/) | Utility-first CSS framework for mobile-first styling and theme tokens. |
| **`postcss`** | `^8.5.6` | [PostCSS Docs](https://postcss.org/) | CSS transformation engine processing Tailwind and Autoprefixer rules. |
| **`eslint`** | `^9.32.0` | [ESLint Docs](https://eslint.org/) | Pluggable JavaScript and TypeScript linting utility. |
| **`typescript-eslint`** | `^8.38.0` | [TS ESLint Docs](https://typescript-eslint.io/) | Tooling allowing ESLint to analyze and enforce TypeScript code standards. |
