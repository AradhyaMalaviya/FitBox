# Cloudflare Pages Deployment Guide for FitBox

This guide walks you through deploying **FitBox** to **Cloudflare Pages**. 

**Canonical production website:** [https://fitbox-cto.pages.dev/](https://fitbox-cto.pages.dev/)

**Cloudflare Pages project name:** `fitbox` (serves the canonical `fitbox-cto.pages.dev` hostname)

Cloudflare Pages provides:
- **Free unlimited bandwidth** & global Anycast CDN.
- **Instant cache invalidation** and zero cold starts.
- Automatic custom domain management with free SSL.
- Automatic SPA fallback to `/` for unknown routes when the output has no top-level `404.html`.

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

### 1.3 Verify Edge Function Secrets

The Supabase `fitness-chat` and `project-assistant` functions require `LOVABLE_API_KEY` and `GEMINI_API_KEY`, respectively. Check that both secret names exist in the linked Supabase project:
```bash
supabase secrets list --project-ref xmbardirxjhdamaeiuhx
```
Keep these provider keys in Supabase Edge Function secrets; they must not be added to the frontend's `VITE_` variables.

---

## 2. Deployment Methods

Choose either **Method A** (Git-connected, recommended for automated continuous deployment) or **Method B** (Direct CLI deployment).

---

### Method A: Git Integration via Cloudflare Dashboard (Recommended)

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, select **Workers & Pages** > **fitbox**.
3. Configure the Pages build settings under **Settings > Builds**:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: **Leave blank / empty** (`/`)
4. Under **Environment variables**, add:
   - `NODE_VERSION` = `22.16.0` (or `22`)
   - `VITE_SUPABASE_URL` = `<your-supabase-project-url>`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `<your-supabase-publishable/anon-key>`
5. Save and deploy. The Vite config checks the required Supabase variables before producing client bundles, so missing values fail the build instead of publishing an app that crashes before React starts.

> **Routing note:** Cloudflare Pages serves the SPA entry point for direct links and refreshes when no top-level `404.html` is present. The separate `wrangler.toml` Worker configuration does not control Pages deployments.

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
   *(The `deploy:pages` script targets the existing `fitbox` project, whose production hostname is `fitbox-cto.pages.dev`.)*

4. The `fitbox` Pages project already exists. Do not create a duplicate project; its production hostname is `fitbox-cto.pages.dev`.

---

## 3. How SPA Routing & Caching Work

1. **Cloudflare Pages SPA Routing**: Pages automatically serves the root app for a route that does not match a static asset when the build output has no top-level `404.html`. This covers direct links and refreshes such as `/exercises`, `/nutrition`, and `/gymbuddy`. Do not add a catch-all `_redirects` rewrite: it can also rewrite requests for assets such as the manifest and JavaScript bundles.

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
2. Keep the production hostname set to `fitbox-cto.pages.dev`.

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
4. Select the existing Pages project `fitbox` and keep `fitbox-cto.pages.dev` as the production hostname.
5. For automatic preview deployments, enable **Automatic deployments** for Pull Requests and feature branches. Treat preview hostnames as review-only; the production URL remains `https://fitbox-cto.pages.dev/`.

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
- **Cause**: A top-level `404.html` disables Pages' default SPA fallback, or the uploaded build does not contain the expected `index.html`.
- **Solution**:
  1. Confirm the Pages output directory is `dist` and contains `index.html`.
  2. Remove a top-level `404.html` only if this project is intended to use SPA routing.
  3. Test a direct route such as `/exercises` and refresh it. The canonical Pages project has been checked to return the SPA document with HTTP 200.

### 7.3 Build Fails: "Missing Supabase Environment Variables"
- **Cause**: FitBox requires these values to create the Supabase client. The Vite config validates them before bundling, so a missing value stops the build rather than producing a bundle that crashes before React mounts.
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
