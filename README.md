# FitBox

**Train with direction. Eat with intention. Find your training people.**

FitBox is a mobile-friendly fitness and nutrition app that brings exercise discovery, workout planning and tracking, practical Indian nutrition guidance, and GymBuddy training-partner matching into one place. It combines a searchable exercise library and interactive anatomy tools with Supabase-backed accounts and social features, plus AI coaching and project help.

[Open the live app](https://fitbox-cto.pages.dev/) · [View the source](https://github.com/AradhyaMalaviya/FitBox) · [Deployment guide](CLOUDFLARE_PAGES_DEPLOYMENT.md)

![FitBox preview showing the interactive muscle map and GymBuddy experience](public/preview.png)

## What you can do

- **Explore exercises:** browse and filter the catalog by muscle group, equipment, and difficulty; open exercise instructions, cues, and available video demonstrations.
- **Find movements by need:** use guided catalog search with fitness-specific terms and synonyms, then open matching exercise details.
- **Plan and log training:** build a workout, browse session templates and multi-day routines, and record sets in the active workout tracker.
- **Use fitness tools:** view the interactive muscle map and use calculators for training and nutrition planning.
- **Plan meals around your goals:** complete the nutrition questionnaire, review calorie and macro targets, and explore foods and meal ideas with Indian staples and vegetarian options.
- **Ask the fitness coach:** chat with the streamed fitness assistant, use the local trainer for quick exercise and warm-up guidance, or choose a guided action to search exercises, estimate macros or a one-rep max, look up food nutrition, or add an exercise to your active workout.
- **Find a GymBuddy:** create a training profile, discover compatible partners, match, message, and log shared sessions.
- **Keep learning:** browse the stretch and mobility library, workout and routine libraries, and fitness articles.
- **Get project help:** open the project-aware assistant for answers about FitBox routes, architecture, and repository documentation.

Guided exercise results are ranked using local catalog text matching and fitness-specific synonyms. The repository also includes a pgvector migration for exercise and food embeddings; this schema is separate from the current local guided-search implementation.

## Technology

| Area | Tools |
| --- | --- |
| Web app | React 18, TypeScript, Vite 8 |
| UI | Tailwind CSS, shadcn/ui, Radix UI, Lucide |
| Routing and data | React Router 7, TanStack Query 5, React Context |
| Forms and validation | React Hook Form, Zod |
| Backend | Supabase Auth, PostgreSQL, Row Level Security, Realtime, Storage, Edge Functions |
| AI services | Gemini 2.5 Flash Lite through the Lovable AI Gateway for fitness chat; Gemini API for the project assistant |
| Hosting | Cloudflare Pages |

## Get started

### Requirements

- Node.js **22.16.0** (the version is recorded in `.node-version` and `.nvmrc`)
- npm
- A Supabase project for the app's account and data features

### Install and run

```bash
git clone https://github.com/AradhyaMalaviya/FitBox.git
cd FitBox
npm install
cp .env.example .env
```

Set the two frontend values in `.env` using credentials from your Supabase project:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Then start the development server:

```bash
npm run dev
```

Vite serves the app at `http://localhost:5173`. Both frontend variables are required by the app and by the production build. `VITE_SUPABASE_URL` must use HTTPS except when pointing to localhost.

### Configure Supabase features

The browser app uses Supabase for sign-in and application data. To run the complete backend locally or deploy it to your own Supabase project:

1. Link the Supabase CLI to your project and apply the timestamped database migrations with `supabase db push`.
2. Deploy the Edge Functions under `supabase/functions/` using the Supabase CLI.
3. Configure the function secrets in the Supabase dashboard or with the CLI:

   | Secret | Used by |
   | --- | --- |
   | `LOVABLE_API_KEY` | `fitness-chat` — streamed fitness coaching |
   | `GEMINI_API_KEY` | `project-assistant` — project-aware help |
   | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | `get-trainer-contact` |

The optional `npm run upload:exercise-media` command also needs `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Keep service-role and AI provider keys in server-side secrets; never use a `VITE_` variable for a private key or commit `.env` values.

See [Cloudflare Pages deployment](CLOUDFLARE_PAGES_DEPLOYMENT.md) for the production setup and backend details.

## App routes

Most product routes require a signed-in user. `/` and `/auth` are public; password recovery is available at `/reset-password`.

| Route | Area |
| --- | --- |
| `/dashboard` | Personalized home and feature navigation |
| `/onboarding` | Fitness and preference setup |
| `/exercises` and `/exercise/:exerciseId` | Exercise catalog and detail pages |
| `/generate-workout` | Workout creation flow |
| `/workout/active` | Active session and set tracking |
| `/nutrition`, `/nutrition/questionnaire`, `/nutrition/roadmap` | Nutrition planning |
| `/tools` and `/tools/:toolTab` | Fitness calculators and anatomy tools |
| `/generator` | Workout and training-split builder |
| `/workouts` and `/routines` | Session templates and multi-day programs |
| `/stretches` | Stretch and mobility catalog |
| `/articles` and `/articles/:articleId` | Fitness reading library |
| `/gymbuddy/setup` | Training-partner profile setup |
| `/gymbuddy/discover` | Browse and match with training partners |
| `/gymbuddy/matches` and `/gymbuddy/chat/:matchId` | Matches and messaging |
| `/gymbuddy/settings` | GymBuddy preferences |

## Project structure

```text
src/
  App.tsx                 Route tree, providers, and global assistant widgets
  pages/                  Dashboard, exercise, workout, nutrition, tools, and social routes
  components/             Shared UI, exercise views, chat, workout, and GymBuddy components
  contexts/               Auth, workout, and GymBuddy notification state
  data/                   Exercise, food, article, stretch, and workout catalogs
  hooks/                  Reusable workout and GymBuddy behavior
  lib/                    Auth, calculations, search, and application services
  integrations/supabase/  Supabase client and generated database types
supabase/
  functions/              fitness-chat, project-assistant, get-trainer-contact
  migrations/             Ordered PostgreSQL schema and policy changes
scripts/                  Knowledge builder, media uploader, audits, and test suites
public/                   App icons, exercise media, and preview image
```

`src/data/projectKnowledge.ts` is generated from project documentation, routes, configuration, and the source tree. After changing project docs, refresh it with `npm run build:knowledge`; do not edit the generated file by hand.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create the production bundle in `dist/` |
| `npm run build:dev` | Build with Vite's development mode |
| `npm run preview` | Serve the production bundle locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the fixes and integrity suite |
| `npm run test:beta` | Run the beta suite |
| `npm run test:deep` | Run the deeper runtime and data audit suite |
| `npm run test:ai` | Run the AI and guided-workflow suite |
| `npm run test:all` | Run all four Node-based test suites |
| `npm run build:knowledge` | Regenerate project-assistant context |
| `npm run upload:exercise-media` | Upload exercise media to Supabase Storage |
| `npm run deploy:pages` | Build and deploy to Cloudflare Pages with Wrangler |

### Browser automation

The Microsoft Playwright CLI is available as a local development dependency:

```bash
npm run playwright:cli -- --help
npm run playwright:cli -- open http://localhost:5173
```

VS Code can also launch the Playwright MCP server from `.vscode/mcp.json` when the server is enabled in the MCP picker.

## Deployment

The canonical production app is hosted on [Cloudflare Pages](https://fitbox-cto.pages.dev/). The project deploys the Vite output from `dist/`; the Cloudflare build requires the same two `VITE_SUPABASE_*` variables used locally. AI and trainer-contact functionality also requires the corresponding Supabase Edge Functions and server-side secrets.

For dashboard settings, CLI deployment, migrations, and troubleshooting, see [CLOUDFLARE_PAGES_DEPLOYMENT.md](CLOUDFLARE_PAGES_DEPLOYMENT.md).

## Maintainer

**Aaradhya Malaviya** · [GitHub](https://github.com/AradhyaMalaviya) · [LinkedIn](https://linkedin.com/in/aaradhyamalaviya)

## License

Proprietary. Copyright © 2026 Aaradhya Malaviya. All rights reserved.
