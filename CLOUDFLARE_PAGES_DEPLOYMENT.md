# Cloudflare Pages Deployment Guide for FitBox

This guide walks you through deploying **FitBox** to **Cloudflare Pages**. 

Cloudflare Pages provides:
- **Free unlimited bandwidth** & global Anycast CDN.
- **Instant cache invalidation** and zero cold starts.
- Automatic custom domain management with free SSL.
- Full SPA client-side routing via `_redirects`.

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
2. In the left navigation, select **Compute (Workers & Pages)** > **Pages**.
3. Click **Connect to Git** and authorize your GitHub / GitLab account.
4. Select your FitBox repository (`art-decoder-tool` or root repo).
5. Configure the build settings:
   - **Project name**: `fitbox` (or your preferred name)
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: **Leave blank / empty** (do NOT enter `art-decoder-tool` — the repository root contains `package.json` directly)
6. Expand **Environment variables (advanced)** and add:
   - `VITE_SUPABASE_URL` = `<your-supabase-project-url>`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `<your-supabase-publishable/anon-key>`
   - `NODE_VERSION` = `20` *(Note: `.node-version` is also committed to ensure Node 20 is used)*
7. Click **Save and Deploy**. Cloudflare will build and publish your site with a `*.pages.dev` URL.

> [!TIP]
> **Cloudflare Workers Builds vs Pages**:
> If your project was connected in Cloudflare as a **Worker** (which runs `Workers Builds: fitbox`), FitBox provides a root [wrangler.toml](file:///C:/Users/deepa/Downloads/musclewebsite%20test%202/art-decoder-tool/wrangler.toml) and [worker.js](file:///C:/Users/deepa/Downloads/musclewebsite%20test%202/art-decoder-tool/worker.js) that automatically compiles the SPA via `npm run build` and serves `./dist` with SPA fallback routing. Ensure that **Root directory** in your Cloudflare dashboard (Settings > Builds) is **empty/blank**.

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

We have preconfigured two critical files in [`public/`](file:///C:/Users/deepa/Downloads/musclewebsite%20test%202/art-decoder-tool/public) that are bundled directly into `dist/`:

1. **`public/_redirects`**:
   ```text
   /*    /index.html   200
   ```
   Ensures that direct visits or browser refreshes on client-side routes (e.g., `/exercise/1`, `/nutrition`, `/auth`, `/gymbuddy`) are correctly served by `index.html` without returning HTTP 404.

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
