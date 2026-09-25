# FitBox

AI-powered fitness & nutrition web app: React 18 + TypeScript SPA on Vite 5, Supabase (Postgres/Auth/Realtime/Storage/Edge Functions), shadcn/ui + Radix, TanStack Query, React Router 6, Zod. Deploys to Vercel. No tests, no Python code (despite the misleading `requirements.txt`).

## Branch / repo state

- Branch: `main`, synchronized with `origin/main` at `aab1292`.
- Recent work includes the Gemini fitness-chat integration and the globally mounted project assistant.

### Recent commits

| sha       | message                                                                  |
| --------- | ------------------------------------------------------------------------ |
| `aab1292` | feat(assistant): add globally mounted Gemini-direct project chatbot and knowledge builder |
| `c1df9d0` | feat(chat): wire GymTrainerChat to fitness-chat Edge Function and Gemini 2.5 Flash Lite |
| `6a1984b` | fix(auth): correct misleading "Username already taken" error → reference email |
| `220629a` | fix(auth): rewrite forgot-password to use email + Supabase `resetPasswordForEmail` |
| `5ac2f1a` | feat(auth): add `resetPassword` wrapper to `AuthContext`                 |
| `60a1b26` | fix(onboarding): persist preferences to Supabase + localStorage (not dev-only mock API) |
| `9892f16` | chore(db): add `profiles.preferences` jsonb for onboarding wizard         |
| `a8a154d` | fix(muscle-map): wrap `ExerciseVideoPlayer` in `ErrorBoundary` in `ExerciseResults` |
| `b639c5f` | fix(video): replace `throw` with inline fallback in `ExerciseVideoPlayer` |

Files touched by the latest work include `src/components/ProjectAssistantChat.tsx`, `src/data/projectKnowledge.ts`, `scripts/build-project-knowledge.mjs`, `supabase/functions/project-assistant/index.ts`, `src/components/GymTrainerChat.tsx`, and `supabase/functions/fitness-chat/index.ts`.

## Recent history (chronological)

- 2026-09-08: Global project assistant, generated project knowledge, and direct Gemini integration.
- 2026-09-07: Fitness chat wiring, Gemini 2.5 Flash Lite upgrade, and trainer chat cleanup.
- 2026-09-02: Auth + onboarding hardening, muscle-map video crash fix.
- 2026-08-03: Docs — FitBox PRD & Synopsis refreshed for dual-identity architecture + gateway AI (`53a55c8`); user-id / profile-id schema alignment (`b546637`).
- 2026-07-22: Comprehensive bug fixes, type safety, production remediation (`8a3902b`).
- 2026-04-27: GymBuddy matchmaking system schema + realtime (`233af57` + migrations `20260427000000_gymbuddy_schema.sql`, `20260427000001_gymbuddy_realtime.sql`).
- Earlier: fitness-chat + project-assistant + trainer-contact Edge Functions, exercise media bucket migration, auth/guest routing, ErrorBoundary, YouTube video support, SEO fixes.

## Dev environment

Node 22 LTS (Node 22+ required by Wrangler & modern toolchain); npm is the documented toolchain — dependencies are managed with `package-lock.json`.

```sh
npm install
npm run dev          # vite dev server, http://localhost:5173 (auto-opens)
```

Required env vars in `.env` (validated at runtime by `src/lib/env.ts` — missing values throw):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

For `scripts/upload-exercise-media.mjs` add `SUPABASE_SERVICE_ROLE_KEY`. The `fitness-chat` function needs `LOVABLE_API_KEY`; `project-assistant` needs `GEMINI_API_KEY`; Supabase functions also use their project URL and anon key.

## Build & test

```sh
npm run build        # tsc -b && vite build        → dist/
npm run build:dev    # vite build --mode development
npm run preview      # serve the production build locally
npm run lint         # eslint .   (config: eslint.config.js; ignores dist/)
npm run upload:exercise-media
npm run build:knowledge
```

No test runner, no `test` script. CI is not configured in this repo. `package.json` has no `typecheck` script — `npm run build` runs `tsc -b` against `tsconfig.app.json` + `tsconfig.node.json` (references in `tsconfig.json`).

## Layout

```
src/
  App.tsx (115), main.tsx (5), index.css, App.css, vite-env.d.ts
  components/   ui/ shadcn primitives; + subdirs:
                exercise/        ExerciseVideoPlayer, ExercisePoster
                workout/         AddExerciseDrawer, ExerciseLogCard,
                                StartWorkoutCard, WorkoutHeader
                muscle-map/      ExerciseResults, ExerciseResultCard,
                                MuscleMapContainer, MuscleMapSVG,
                                InteractiveBodyDiagram, EquipmentFilter, index.ts
                gymbuddy/        GymBuddyCard, GymBuddyEmpty,
                                GymBuddyMatchOverlay, GymBuddyRadar,
                                GymBuddySessionModal, GymBuddySettings,
                                WorkoutStreak
                layout/          (empty — reserved)
                + flat: AnalyticsTracker, BodyDiagram, ErrorBoundary,
                        exercise/ExerciseCard.tsx, ExerciseModal,
                        FitnessChat, GymTrainerChat, ProjectAssistantChat, Header,
                        HeroSection, MuscleGroupFilter, MuscleMap,
                        TrainerContactButton
  pages/        one file per route (16 page files):
                LandingPage, Index, Auth (363), Onboarding (929),
                Exercises, ExerciseDetail, GenerateWorkout, ActiveWorkout,
                Nutrition, NutritionQuestionnaire, NutritionRoadmap,
                GymBuddyDiscover, GymBuddyMatches, GymBuddyChat,
                GymBuddyProfileSetup, NotFound
  contexts/     AuthContext (320), WorkoutContext, GymBuddyNotificationContext
  hooks/        useGymBuddy, useGymBuddyChat, useGymBuddyStreak,
                useWorkoutSave, useTrainerContact, use-toast, use-mobile
  lib/          env, authSchemas, muscleMapping, onboarding,
                compatibilityScore, exerciseMedia, gymBuddyTypes,
                analytics, utils
  data/         exercises.ts, indianFoodDatabase.ts,
                projectKnowledge.ts (AUTO-GENERATED — do not hand-edit)
  constants/, types/, utils/, integrations/supabase/types.ts, assets/
supabase/
  config.toml   project_id = "xmbardirxjhdamaeiuhx"
  migrations/   timestamped SQL (do not rename) — see list below
  functions/    fitness-chat/, project-assistant/, get-trainer-contact/
                (Deno; SSE fitness chat, direct Gemini assistant, audit)
public/         favicons, robots.txt, demo videos, preset images
scripts/        upload-exercise-media.mjs (Node, uses node:fs/promises)
                build-project-knowledge.mjs (generates src/data/projectKnowledge.ts)
```

### Supabase migrations (apply order)

1. `20251007065542_5c736262-…sql`
2. `20251101134359_5da3b141-…sql`
3. `20251101134429_3364976a-…sql`
4. `20251102102609_ac2dee1f-…sql`
5. `20251103054708_7d8f9601-…sql`
6. `20251104092222_cc02532f-…sql`
7. `20251104092449_46219c0c-…sql`
8. `20251107094622_51a3f036-…sql`
9. `20251225085147_ae0eeca2-…sql`
10. `20251225093341_a0379854-…sql`
11. `20260326104045_create_bookings_table.sql`
12. `20260327000000_create_exercise_media_bucket.sql`
13. `20260427000000_gymbuddy_schema.sql`
14. `20260427000001_gymbuddy_realtime.sql`
15. `20260902024538_add_profiles_preferences.sql`
16. `20260921000000_fitbox_remediation.sql`
17. `20260925000000_storage_and_realtime_remediation.sql`
18. `20260925120000_fix_gymbuddy_profiles_recursion.sql`

Path alias: `@/*` → `src/*` (set in `tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`). shadcn aliases live in `components.json` (`ui` → `src/components/ui`, `lib` → `src/lib`, `hooks` → `src/hooks`).

## Conventions

- Routing: routes defined in `src/App.tsx` with `lazy(() => import("./pages/…"))`; new pages go in `src/pages/` and are wired with a `Route` inside the existing `<Routes>` block **above** the catch-all `*` → `NotFound` (see comment in `App.tsx`).
- Auth gating: wrap protected pages in `<ProtectedRoute>`; auth-only pages in `<PublicRoute>`. Both read from `useAuth()`.
- State: server state via TanStack Query; cross-tree state via `src/contexts/*`. Forms use `react-hook-form` + Zod resolvers (e.g. `src/lib/authSchemas.ts`).
- Supabase: client + env validation in `src/lib/env.ts`; never read `import.meta.env` directly elsewhere.
- Edge functions: Deno, `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"`. Registered functions are `fitness-chat`, `project-assistant`, and `get-trainer-contact`; all have `verify_jwt = true` in `supabase/config.toml`.
- Migrations: filename pattern `<timestamp>_<uuid>.sql` — keep the timestamp prefix for ordering.
- Commit style (from `git log`): `fix: …`, `feat: …`, `chore(config): …`, `docs: …` — Conventional Commits, often in quotes for the older WIP commits.

## Pitfalls

- `requirements.txt` is comments-only on purpose — do **not** add Python deps here. `requirements.md` documents this explicitly.
- `src/lib/env.ts` throws on startup if `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` are missing. The dev server won't render without them; copy from a teammate or the Supabase dashboard.
- `eslint-report.txt` is a 9 KB binary blob in the repo root, not source — do not open or edit it; it appears to be a captured terminal log.
- `vercel.json` rewrites every non-asset path to `/index.html` for SPA routing — when adding static assets under a new path, update the regex or serve them from `public/` so the rewrite doesn't shadow them.
- Vite dev server has a mock `/api/onboarding/preferences` POST endpoint hard-coded in `vite.config.ts` (in-memory only, lost on restart). It existed only for local onboarding UX; **as of `60a1b26` the onboarding page bypasses it** and persists to Supabase + localStorage directly. Do not reintroduce a dependency on the dev mock.
- `npm run upload:exercise-media` requires `SUPABASE_SERVICE_ROLE_KEY` in env — this key bypasses RLS; never log it or commit it.
- TypeScript is intentionally loose: `noImplicitAny: false`, `strictNullChecks: false`, `noUnusedLocals: false`, `noUnusedParameters: false` (see `tsconfig.json`). `eslint` has `@typescript-eslint/no-unused-vars` turned off. Don't tighten these without coordinating with the team — many existing files rely on the lax settings.
- `npm` is the exclusive package manager. Stale `bun.lockb` has been removed to avoid Cloudflare/Vercel build tool mismatches. Always use `npm install` and commit `package-lock.json`.
- Don't hand-edit `dist/`, `*.tsbuildinfo`, or `node_modules/` — all are gitignored and regenerated by `build`.
- **Auth error wording**: the Auth page previously surfaced a generic "Username already taken" toast on sign-up failures (`6a1984b` fixed it). When touching `src/pages/Auth.tsx`, keep the error message routed to the actual Supabase error and reference *email* when the failure is a duplicate-account / auth error.
- **`resetPassword`** flow is `useAuth().resetPassword(email)` → Supabase `resetPasswordForEmail` (redirect handled in `src/contexts/AuthContext.tsx`). Do not introduce a username-based reset path.
- **`profiles.preferences`** is a jsonb column added by `20260902024538`. `Onboarding.tsx` reads/writes it via TanStack Query + `localStorage` fallback. Schema for the JSON lives in the migration file; any new preference key must be added there first or onboarding will silently drop it.
- **`ExerciseVideoPlayer` must not throw.** It now degrades to an inline fallback (poster + message) on failure and is wrapped in `ErrorBoundary` from `ExerciseResults`. New video sources should plug into the existing error path, not `throw`.
- **`src/data/projectKnowledge.ts` is generated.** It is produced by `npm run build:knowledge` (`scripts/build-project-knowledge.mjs`) from the docs, `App.tsx` routes, `env.ts`, `config.toml`, and the repo tree. Do not hand-edit it; regenerate it (and commit the result) after changing any of the source docs so the `project-assistant` Edge Function serves current context.
- **Edge function secrets differ per function.** `fitness-chat` reads `LOVABLE_API_KEY`; `project-assistant` reads `GEMINI_API_KEY` (direct `generativelanguage.googleapis.com` call, non-streaming JSON reply); `get-trainer-contact` reads `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.