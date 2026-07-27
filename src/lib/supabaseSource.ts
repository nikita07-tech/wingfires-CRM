// A read-only connection to your WEBSITE's database (Lovable/Supabase).
// This CRM only ever SELECTs from it — it never writes anything back.
// Uses the service role key so it can read regardless of that database's
// row-level security rules, since this runs only on the server, never in
// the browser.

import { createClient } from "@supabase/supabase-js";

export function getSourceClient() {
  const url = process.env.SOURCE_SUPABASE_URL;
  const key = process.env.SOURCE_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SOURCE_SUPABASE_URL / SOURCE_SUPABASE_SERVICE_ROLE_KEY env vars");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
