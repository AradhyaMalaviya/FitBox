# Cloudflare Pages Deployment Guide for FitBox

This guide walks you through deploying **FitBox** to **Cloudflare Pages**. 

Cloudflare Pages provides:
- **Free unlimited bandwidth** & global Anycast CDN.
- **Instant cache invalidation** and zero cold starts.
- Automatic custom domain management with free SSL.
- Full SPA client-side routing via `wrangler.toml` (`not_found_handling = "single-page-application"`).

---

## 1. Pre-Deployment Setup (Supabase)

Before deploying the frontend, ensure your Supabase storage and database are up to date:

### 1.1 Upload Exercise Media to Supabase Storage
Ensure `SUPABASE_SERVICE_ROLE_KEY` is present in your environment or `.env`, then run:
```bash
npm run upload:exercise-media
```
This syncs all required exercise posters and preview videos to your Supabase `exercise-media` storage bucket.

### 1.2 Apply Database Migrations
Deploy all recent database migrations (including schema updates and storage policies):
```bash
supabase db push
```
*(Or execute the SQL files in `supabase/migrations/` via the Supabase Dashboard SQL Editor).*

---

## 2. Deployment Methods

Choose either **Method A** (Git-connected, recommended for automated continuous deployment) or **Method B** (Direct CLI deployment).

---

### Method A: Git Integration via Cloudflare Dashboard (Recommended)

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, select **Compute (Workers & Pages)** > **fitbox**.
3. Configure the build settings (under **Settings > Builds**):
   - **Build command**: `npm run build`
   - **Deploy command**: `npx wrangler deploy`
   - **Output directory**: `dist`
   - **Root directory**: **Leave blank / empty** (`/`)
4. Under **Build variables**:
   - `NODE_VERSION` = `22.16.0` (or `22`)
   - `VITE_SUPABASE_URL` = `<your-supabase-project-url>`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `<your-supabase-publishable/anon-key>`
5. Click **Save and Deploy**. Cloudflare will build and publish your site.

> [!TIP]
> **Cloudflare Workers Builds**:
> FitBox provides a root [wrangler.toml](file:///C:/Users/deepa/Downloads/musclewebsite%20test%202/art-decoder-tool/wrangler.toml) and [worker.js](file:///C:/Users/deepa/Downloads/musclewebsite%20test%202/art-decoder-tool/worker.js) that automatically compiles the SPA via `npm run build` and serves `./dist` with native SPA fallback routing (`not_found_handling = "single-page-application"`). Ensure that **Root directory** in your Cloudflare dashboard (Settings > Builds) is **empty/blank**.

---

### Method B: Direct CLI Deployment via Wrangler

If you prefer to build locally and deploy directly from your terminal:

1. **Log in to Cloudflare**:
   ```bash
   npx wrangler login
   ```
   *(A browser window will open to authenticate your Cloudflare account).*

2. **Build the production bundle**:
   ```bash
   npm run build
   ```

3. **Deploy the output directory**:
   ```bash
   npm run deploy:pages
   ```
   *(Or run: `npx wrangler pages deploy dist --project-name=fitbox`)*

4. If prompted to create a new project, select **Create a new project** and confirm the project name `fitbox`.

---

## 3. How SPA Routing & Caching Work

1. **`wrangler.toml` SPA Routing**:
   ```toml
   [assets]
   directory = "./dist"
   binding = "ASSETS"
   not_found_handling = "single-page-application"
   ```
   Cloudflare Workers Static Assets natively routes all deep links and client refreshes (e.g., `/exercises`, `/nutrition`, `/gymbuddy`) to `index.html` with HTTP 200, without needing any redirect rules (avoiding redirect loop issues).

2. **`public/_headers`**:
   ```text
   /*
     X-Content-Type-Options: nosniff
     X-Frame-Options: SAMEORIGIN
     Referrer-Policy: strict-origin-when-cross-origin

   /assets/*
     Cache-Control: public, max-age=31536000, immutable

   /*.html
     Cache-Control: public, max-age=0, must-revalidate

   /index.html
     Cache-Control: public, max-age=0, must-revalidate
   ```
   Enforces security headers, enables 1-year immutable edge caching for hashed JS/CSS assets, and guarantees instant revalidation for HTML so users always receive latest releases.

---

## 4. Custom Domains & SSL

1. In the Cloudflare Pages dashboard for your project, click **Custom domains**.
2. Click **Set up a custom domain** (e.g. `fitbox.app` or `fitness.yourdomain.com`).
3. If your domain's DNS is managed by Cloudflare, it will automatically provision the CNAME record and issue a free SSL/TLS certificate within seconds.

---

## 5. Post-Deployment Verification Checklist

Once deployed, verify the live deployment:

- [ ] **SPA Route Refresh**: Navigate to `/exercises`, then refresh the page (`F5`). Confirm it renders the exercises list rather than a 404 error.
- [ ] **Deep Link Routing**: Open a direct exercise detail link (e.g., `/exercise/1`) in a new tab.
- [ ] **Supabase Connectivity**: Open DevTools (`F12` > Console & Network) and verify that authentication, exercise data, and GymBuddy queries load cleanly from Supabase.
- [ ] **Media Assets**: Verify that posters load properly on the exercise cards and that video streaming begins when focusing on an exercise video player.


---

## 6. Step-by-Step Guide for Deploying Updates & Continuous Deployment (CI/CD)

Maintaining and deploying regular updates to FitBox via Cloudflare Pages is automated once configured. Follow these procedures for day-to-day release management:

### 6.1 Connecting or Reconnecting GitHub Repository
1. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), navigate to **Compute (Workers & Pages)** > **Create application** > **Pages** > **Connect to Git**.
2. Select your GitHub account and authorize access to the repository: `AradhyaMalaviya/FitBox`.
3. Choose the production branch (typically `main`).
4. Set the project name to `fitbox` (or your chosen identifier).
5. For automatic preview deployments, enable **Automatic deployments** for Pull Requests and feature branches. Each pull request will automatically generate a unique immutable preview URL (e.g. `https://<hash>.fitbox.pages.dev`).

### 6.2 Standard Update Deployment Workflow
To deploy a new feature, bugfix, or content update:
1. Ensure your local tests and build pass cleanly:
   ```bash
   npm run build
   ```
2. Commit your changes following conventional commits:
   ```bash
   git add .
   git commit -m "feat(ui): enhance muscle map responsiveness"
   git push origin main
   ```
3. Cloudflare Pages automatically detects the commit to `main`, triggers a clean virtual build container running Node 22, executes `npm run build`, and deploys the generated `./dist` bundle to Cloudflare's global edge network in under 60 seconds.

---

## 7. Troubleshooting Common Deployment Issues & Edge Pitfalls

When building or deploying FitBox to Cloudflare Pages, the following issues may arise. Use these proven remediation steps:

### 7.1 Build Fails: "Node Version Incompatibility" or "SyntaxError: Unexpected token"
- **Cause**: Cloudflare Pages defaults to an older LTS version of Node (such as Node 18 or 20) unless specified, which causes build errors with modern ES modules, Vite 5, or TypeScript 5.8 features.
- **Solution**:
  1. Open Cloudflare Dashboard > **Workers & Pages** > `fitbox` > **Settings** > **Builds & deployments** > **Environment variables**.
  2. Add or update the variable `NODE_VERSION` with the value `22.16.0` (or `22`).
  3. Trigger a manual rebuild via **Deployments** > **View details** > **Retry deployment**.

### 7.2 404 Error on Page Refresh or Deep Link (e.g., `/nutrition/roadmap`, `/exercises`)
- **Cause**: Client-side routing fails when the static server attempts to find an actual directory or file matching `/nutrition/roadmap/index.html`.
- **Solution**:
  1. Confirm that [wrangler.toml](file:///C:/Users/deepa/Downloads/musclewebsite%20test%202/art-decoder-tool/wrangler.toml) contains:
     ```toml
     [assets]
     directory = "./dist"
     binding = "ASSETS"
     not_found_handling = "single-page-application"
     ```
  2. In Cloudflare Dashboard, verify **Root directory** under Build Settings is **empty/blank** so Cloudflare uses the root `wrangler.toml` and `worker.js` routing logic.
  3. Ensure `public/_headers` does not define conflicting rewrite rules.

### 7.3 Runtime Crash: "Missing Supabase Environment Variables"
- **Cause**: FitBox validates required variables on initialization in [`src/lib/env.ts`](file:///C:/Users/deepa/Downloads/musclewebsite%20test%202/art-decoder-tool/src/lib/env.ts). If `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` are undefined, the app throws an unhandled error during bundle initialization.
- **Solution**:
  1. Open Cloudflare Dashboard > `fitbox` > **Settings** > **Environment variables**.
  2. Set both `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under both **Production** and **Preview** scopes.
  3. Note that Vite requires the `VITE_` prefix for client-accessible environment variables. Variables without this prefix will not be bundled into the client code.

### 7.4 Stale Assets or Delayed Update Reflection
- **Cause**: Aggressive browser or intermediary caching of `index.html`.
- **Solution**:
  1. Verify [`public/_headers`](file:///C:/Users/deepa/Downloads/musclewebsite%20test%202/art-decoder-tool/public/_headers) includes the revalidation policy:
     ```text
     /*.html
       Cache-Control: public, max-age=0, must-revalidate
     /index.html
       Cache-Control: public, max-age=0, must-revalidate
     ```
  2. Purge Cloudflare cache via **Workers & Pages** > `fitbox` > **Manage** > **Purge Cache** if an immediate global invalidation is required.

### 7.5 Storage Bucket 403 Forbidden on Exercise Videos
- **Cause**: Supabase Storage bucket `exercise-media` lacks public read policies or media assets were not uploaded to the target Supabase environment.
- **Solution**:
  1. Set your `SUPABASE_SERVICE_ROLE_KEY` locally and run:
     ```bash
     npm run upload:exercise-media
     ```
  2. Ensure the storage migration `20260320000100_create_exercise_media_bucket.sql` or dashboard RLS policy permits `anon` public read access on `exercise-media`.
