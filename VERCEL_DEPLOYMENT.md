# Vercel Deployment Guide for FitBox

FitBox is deployed on **Vercel** as a high-performance Single Page Application (SPA).

- **Live Vercel URL:** [https://fitbox-app.vercel.app/](https://fitbox-app.vercel.app/)
- **Cloudflare Pages URL:** [https://fitbox-cto.pages.dev/](https://fitbox-cto.pages.dev/)

## Build & Project Configuration

Vercel automatically detects the Vite configuration:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node.js Version:** `22.x`

## SPA Routing

Client-side routing is handled seamlessly via [`vercel.json`](vercel.json):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/((?!.*\\..*).*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures deep linking works for all routes (`/exercises`, `/workout/active`, `/nutrition/roadmap`, `/gymbuddy/discover`, etc.) on page refresh.

## Environment Variables

Add the following in your Vercel Project Settings under **Environment Variables**:

- `VITE_SUPABASE_URL`: `https://xmbardirxjhdamaeiuhx.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY`: `<your-supabase-publishable-key>`

See [CLOUDFLARE_PAGES_DEPLOYMENT.md](CLOUDFLARE_PAGES_DEPLOYMENT.md) for full Supabase backend setup and database migrations.
