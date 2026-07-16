import "server-only";

import { createClient } from "@supabase/supabase-js";

import { requireProviderConfig } from "@/lib/config/provider-policy";
import { getSupabaseAdminEnv } from "@/lib/env/server";

export function createSupabaseAdminClient() {
  const env = requireProviderConfig("Supabase admin", getSupabaseAdminEnv());

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}
