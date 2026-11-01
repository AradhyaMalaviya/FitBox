const getRequiredEnv = (name: keyof ImportMetaEnv) => {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`${name} is required. Add it to your local env file and Cloudflare Pages build settings.`);
  }

  return value;
};

export const supabaseUrl = getRequiredEnv("VITE_SUPABASE_URL").replace(/\/$/, "");
export const supabasePublishableKey = getRequiredEnv("VITE_SUPABASE_PUBLISHABLE_KEY");
