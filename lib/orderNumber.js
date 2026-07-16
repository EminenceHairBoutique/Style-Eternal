/**
 * Collision-safe order numbers.
 *
 * Primary path: the next_order_number() Postgres sequence RPC
 * (20260716100000_orders_reconciliation.sql) — strictly monotonic, safe under
 * concurrent webhooks.
 *
 * Fallback (RPC missing, e.g. migrations not yet applied): a
 * timestamp+random suffix that cannot collide with the SE-<seq> scheme and is
 * unique enough for the retry window. The orders table's unique index on
 * order_number is the final backstop either way.
 */
export async function generateOrderNumber(supabase) {
  try {
    const { data, error } = await supabase.rpc("next_order_number");
    if (!error && typeof data === "string" && data.startsWith("SE-")) {
      return data;
    }
    if (error) console.warn("next_order_number RPC unavailable:", error.message);
  } catch (err) {
    console.warn("next_order_number RPC exception:", err?.message || err);
  }

  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SE-${stamp}-${rand}`;
}
