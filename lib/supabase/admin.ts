import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env, requireServiceRole } from "@/lib/env";

export function createAdminClient() {
  return createClient(env.SUPABASE_URL, requireServiceRole(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
