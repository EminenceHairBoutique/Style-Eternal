import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. " +
    "Auth and database calls will not work."
  );
}

/**
 * In-process auth lock.
 *
 * By default supabase-js guards its auth-token storage with the browser
 * `navigator.locks` LockManager. In this app that lock was getting "stolen" by
 * the SDK's own background token refresh (especially with a stale stored
 * session), which left queries hanging indefinitely — manifesting as stuck
 * spinners, blank admin pages, hanging tables, and spurious "no admin access".
 *
 * This lock serializes auth operations within the current tab using a simple
 * per-name promise chain. It never blocks across tabs and can never be stolen,
 * so it eliminates the contention/hang entirely. (It's equivalent to the
 * `processLock` that auth-js ships for non-browser environments.)
 *
 * Signature matches supabase-js: lock(name, acquireTimeout, fn) => Promise.
 */
const lockChains = new Map();
function inProcessLock(name, _acquireTimeout, fn) {
  const prev = lockChains.get(name) || Promise.resolve();
  // Run fn after the previous holder settles (success OR failure).
  const run = prev.then(() => fn(), () => fn());
  // The chain advances when fn settles; swallow errors so it never wedges.
  const settled = run.then(() => {}, () => {});
  lockChains.set(name, settled);
  // Best-effort cleanup so the map doesn't grow unbounded.
  settled.then(() => {
    if (lockChains.get(name) === settled) lockChains.delete(name);
  });
  return run;
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          lock: inProcessLock,
        },
      })
    : null;
