import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client (bypasses RLS — server only, never import
 * from src/).
 *
 * Lazily initialized on first property access so that importing this module
 * is side-effect-free: unit tests can import helpers that depend on it, and a
 * misconfigured deployment fails with a clear error at call time instead of
 * crashing every function at module load.
 */
let _client = null;

function getServerClient() {
  if (_client) return _client;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "[supabaseServer] Missing SUPABASE_URL (or VITE_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY env vars."
    );
  }

  _client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export const supabaseServer = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getServerClient();
      const value = client[prop];
      return typeof value === "function" ? value.bind(client) : value;
    },
  }
);
