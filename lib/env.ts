export const env = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  STRIPE_PRICE_MONTHLY: process.env.STRIPE_PRICE_MONTHLY ?? "",
  STRIPE_PRICE_YEARLY: process.env.STRIPE_PRICE_YEARLY ?? "",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export function isGeminiConfigured(): boolean {
  return env.GEMINI_API_KEY.length > 10;
}

export function isStripeConfigured(): boolean {
  return env.STRIPE_SECRET_KEY.startsWith("sk_");
}

export function isSupabaseConfigured(): boolean {
  return (
    !!env.SUPABASE_URL &&
    !!env.SUPABASE_ANON_KEY &&
    env.SUPABASE_URL.startsWith("https://")
  );
}

export function requireServiceRole(): string {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return env.SUPABASE_SERVICE_ROLE_KEY;
}
