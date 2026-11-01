import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const buildEnv = loadEnv(mode, __dirname, "VITE_");
  const missingEnv = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"]
    .filter((name) => !buildEnv[name]?.trim());

  if (missingEnv.length > 0) {
    throw new Error(
      `Missing required build environment variable${missingEnv.length > 1 ? "s" : ""}: ${missingEnv.join(", ")}. Set them in the local .env file or Cloudflare Pages build settings before building.`
    );
  }

  try {
    const supabaseUrl = new URL(buildEnv.VITE_SUPABASE_URL);
    const isLocalSupabase = ["localhost", "127.0.0.1", "[::1]"].includes(supabaseUrl.hostname);
    if (supabaseUrl.protocol !== "https:" && !isLocalSupabase) {
      throw new Error("VITE_SUPABASE_URL must use HTTPS outside localhost.");
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("VITE_SUPABASE_URL must be a valid absolute URL.");
    }
    throw error;
  }

  return ({
  server: {
    host: "localhost",
    port: 5173,
    strictPort: false,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("@supabase")) {
            return "supabase";
          }

          if (id.includes("@tanstack")) {
            return "react-query";
          }

          if (id.includes("@radix-ui") || id.includes("lucide-react")) {
            return "ui";
          }

          if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("\\react\\") || id.includes("/react/")) {
            return "react";
          }
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  // Simple dev-only API mock for onboarding preferences
  configureServer(server: import('vite').ViteDevServer) {
    const preferences: Record<string, unknown>[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    server.middlewares.use("/api/onboarding/preferences", async (req: any, res: any, next: any) => {
      if (req.method !== "POST") return next();

      try {
        let body = "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req.on("data", (chunk: any) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            const json = JSON.parse(body || "{}");
            const id = `pref_${Date.now()}`;
            const saved = { id, ...json };
            preferences.push(saved);

            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(saved));
          } catch (err) {
            res.statusCode = 400;
            res.end("Invalid JSON");
          }
        });
      } catch (err) {
        res.statusCode = 500;
        res.end("Internal error");
      }
    });
  },
  });
});
