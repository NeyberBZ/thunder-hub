import { createClient } from "@supabase/supabase-js";

export function getSupabaseServer() {
  const url = import.meta.env.SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase server env vars");
  }

  return createClient(url, serviceKey);
}