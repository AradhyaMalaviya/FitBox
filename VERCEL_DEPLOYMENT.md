# Vercel Deployment

## 1. Upload exercise media to Supabase Storage

Add a `SUPABASE_SERVICE_ROLE_KEY` to your shell or `.env.local`, then run:

```sh
npm run upload:exercise-media
```

This creates or updates the public `exercise-media` bucket and uploads:

- `videos/*.mp4`
- `posters/*.svg`

## 2. Apply Supabase migrations

Run your normal Supabase migration flow so the new storage bucket policy is created:

```sh
supabase db push
```

If you manage migrations in the Supabase dashboard instead, apply the SQL from the new migration there.

## 3. Deploy the frontend to Vercel

Import the GitHub repository into Vercel and use:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

Set these environment variables in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## 4. Verify the production site

- Refresh a deep link like `/exercise/1` to confirm SPA rewrites work.
- Open `/exercises` and confirm the page loads poster images only.
- Open an exercise detail and confirm the video loads only in the focused view.


---

## 5. Deployment Platform Comparison: Vercel vs. Cloudflare Pages vs. Traditional VPS

Choosing the ideal hosting platform depends on your operational model, anticipated traffic patterns, and edge compute requirements. The table below compares the primary deployment strategies for FitBox:

| Comparison Vector | Vercel (Current Primary) | Cloudflare Pages / Workers | Traditional VPS / AWS EC2 / Nginx |
| :--- | :--- | :--- | :--- |
| **Hosting Model** | Serverless Edge Network & Static Hosting | Global Anycast CDN & V8 Isolates | Dedicated Linux Virtual Machine |
| **SPA Deep Link Handling** | Handled natively via `vercel.json` rewrites (`"source": "/(.*)", "destination": "/index.html"`) | Handled via `wrangler.toml` (`not_found_handling = "single-page-application"`) | Requires manual Nginx/Apache configuration (`try_files $uri /index.html;`) |
| **Edge Cache & Invalidation**| Instant global cache invalidation on deployment | Instant edge purge across 300+ PoPs | Manual cache management or custom CDN reverse proxy (e.g. CloudFront) |
| **Bandwidth Allocation** | Tier-based (100 GB on Hobby, 1 TB on Pro) | Unlimited free bandwidth on Pages | Billed per GB egress bandwidth |
| **Build & Deploy Velocity** | Native Vite preset detection, fast parallel builds, zero-config PR previews | Fast build containers with customizable Node environments | Manual Git hooks, Docker containers, or self-hosted CI/CD pipelines |
| **Serverless Integration** | Built-in Vercel Serverless Functions (`/api/*`) with Node.js/Go/Python runtimes | Cloudflare Workers running lightweight V8 isolates | Persistent Node/Python process (PM2, systemd, Gunicorn) |
| **Maintenance Overhead** | Zero server maintenance, automated SSL renewal, managed DDoS mitigation | Zero server maintenance, automated SSL, global Anycast DDoS protection | High: OS security patches, firewall setup (UFW), Certbot SSL renewal |

### 5.1 Benefits of Serverless & Modern Jamstack vs. Traditional Hosting

1. **Elimination of Server Maintenance & Operational Debt**:
   - Traditional servers (Ubuntu/Debian on EC2 or Linode) require manual administration, Linux kernel updates, firewall audits, Nginx reverse proxy tuning, and SSL certificate renewals via Let's Encrypt / Certbot.
   - Vercel abstracts all infrastructure management. Deploys are immutable, self-healing, and automatically provisioned with managed TLS certificates.

2. **Elastic Scalability for Viral Traffic Spikes**:
   - In traditional hosting, unexpected viral traffic or heavy gym-time load (e.g., peak evening hours) can exhaust Nginx worker connections or server memory, causing 502/504 gateway timeouts.
   - Vercel and Cloudflare Pages serve FitBox's static assets directly from a globally distributed Content Delivery Network (CDN) edge. Whether 10 users or 100,000 users access the app simultaneously, asset delivery latency remains sub-50ms with zero server degradation.

3. **Dynamic Decoupling with Supabase Edge Functions**:
   - Because FitBox delegates all database transactions, authentication sessions, and heavy AI workloads to Supabase (PostgreSQL + Deno Edge Functions), the frontend deployment host is purely responsible for delivering pre-compiled HTML, CSS, JavaScript, and static media.
   - This architectural decoupling maximizes frontend performance, isolates security concerns, and keeps hosting costs near zero.

---

## 6. Advanced Vercel Configuration & Deployment Walkthrough

### 6.1 Deploying via Vercel CLI
If you prefer deploying from your terminal rather than Git push webhooks:
1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Log in to your Vercel account:
   ```bash
   vercel login
   ```
3. Link your project and deploy:
   ```bash
   vercel
   ```
4. Deploy directly to production:
   ```bash
   vercel --prod
   ```

### 6.2 Managing Environment Variables in Vercel
1. In your project dashboard, navigate to **Settings** > **Environment Variables**.
2. Add the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL (e.g. `https://xmbardirxjhdamaeiuhx.supabase.co`).
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon public API key.
3. Select all environments (**Production**, **Preview**, **Development**).
4. Note: If environment variables are updated, you must trigger a new deployment for Vite to embed the new values into the static client bundle.

---

## 7. Troubleshooting Common Vercel Deployment Pitfalls

- **Issue: 404 Not Found on Deep Route Reloads (e.g., `/gymbuddy/matches`)**:
  - *Fix*: Ensure [`vercel.json`](file:///C:/Users/deepa/Downloads/musclewebsite%20test%202/art-decoder-tool/vercel.json) exists in the repository root and contains the rewrite rule:
    ```json
    {
      "rewrites": [
        {
          "source": "/((?!assets/|.*\\..*).*)",
          "destination": "/index.html"
        }
      ]
    }
    ```
- **Issue: Build Times Out or Fails with TypeScript Errors**:
  - *Fix*: FitBox builds via `npm run build` (`tsc -b && vite build`). Run `npm run build` locally prior to pushing to catch any type reference errors.
- **Issue: Missing Client Env Variables in Browser Console**:
  - *Fix*: Verify that all variables exposed to the client begin with the `VITE_` prefix. Vercel variables lacking `VITE_` will not be bundled by Vite at compile time.
