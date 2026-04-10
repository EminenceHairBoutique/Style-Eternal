import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Receipt, Sparkles, Gift, LogOut, ChevronRight } from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import { useUser } from "../../context/UserContext";
import { LOYALTY, nextTierInfo, tierForSpendCents } from "../../utils/loyalty";

const money = (cents) => {
  const dollars = Number(cents || 0) / 100;
  return `$${dollars.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const niceDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return iso; }
};

export default function AccountDashboard() {
  const { user, logout } = useUser();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!user?.id || !supabase) return;

      setLoading(true);
      setError("");

      try {
        let { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("id, email, loyalty_points, lifetime_spend_cents, first_purchase_bonus_awarded")
          .eq("id", user.id)
          .maybeSingle();

        if (!prof && !profErr) {
          const { data: inserted, error: insErr } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email || null,
              loyalty_points: 0,
              lifetime_spend_cents: 0,
              first_purchase_bonus_awarded: false,
            })
            .select("id, email, loyalty_points, lifetime_spend_cents, first_purchase_bonus_awarded")
            .maybeSingle();
          prof = inserted || null;
          profErr = insErr || null;
        }

        let ordersQuery = supabase
          .from("orders")
          .select("order_number, created_at, amount_total, currency, status")
          .order("created_at", { ascending: false })
          .limit(12)
          .eq("user_id", user.id);

        let { data: ord, error: ordErr } = await ordersQuery;

        if (ordErr && user.email) {
          const fallback = await supabase
            .from("orders")
            .select("order_number, created_at, amount_total, currency, status")
            .eq("email", user.email)
            .order("created_at", { ascending: false })
            .limit(12);
          ord = fallback.data || [];
          ordErr = fallback.error || null;
        }

        if (!cancelled) {
          if (profErr) setError(profErr.message || "Failed to load profile.");
          if (ordErr) setError((prev) => prev || ordErr.message || "Failed to load orders.");
          setProfile(prof || null);
          setOrders(ord || []);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [user?.id, user?.email]);

  const lifetimeSpendCents = useMemo(() => {
    if (profile?.lifetime_spend_cents != null) return Number(profile.lifetime_spend_cents || 0);
    return orders.reduce((sum, o) => sum + Number(o.amount_total || 0), 0);
  }, [profile, orders]);

  const points = useMemo(() => Number(profile?.loyalty_points || 0), [profile]);
  const tier = useMemo(() => tierForSpendCents(lifetimeSpendCents), [lifetimeSpendCents]);
  const nextTier = useMemo(() => nextTierInfo(lifetimeSpendCents), [lifetimeSpendCents]);

  return (
    <div className="bg-se-black text-se-bone min-h-screen pt-28 pb-24">
      <div className="content-wide">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-overline mb-3">My Account</p>
            <h1 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em]">
              {user?.email ? `WELCOME BACK` : "MY ACCOUNT"}
            </h1>
            {user?.email && (
              <p className="text-[13px] text-se-steel font-accent mt-2">{user.email}</p>
            )}
          </div>

          <button
            onClick={logout}
            className="btn-outline inline-flex items-center gap-2"
            type="button"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {error && (
          <div className="mb-6 border border-red-500/30 bg-red-900/20 px-4 py-3 text-[13px] text-red-300">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Crown} label="Membership" value={tier.name} sub="Tier based on lifetime spend" loading={loading} />
          <StatCard icon={Sparkles} label="Points" value={loading ? "—" : points.toLocaleString()} sub="Earned from verified purchases" />
          <StatCard icon={Receipt} label="Lifetime Spend" value={loading ? "—" : money(lifetimeSpendCents)} sub="Used to calculate tier" />
          <StatCard icon={Receipt} label="Orders" value={loading ? "—" : orders.length} sub="Recent purchases" />
        </div>

        {/* Two-column: Loyalty + Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Loyalty */}
          <div className="lg:col-span-5 border border-white/5 bg-se-charcoal p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-overline mb-2">Loyalty</p>
                <h2 className="font-display text-[18px] tracking-[0.08em]">ETERNAL REWARDS</h2>
                <p className="text-[13px] text-se-steel mt-2">
                  Earn <span className="text-se-bone">{LOYALTY.pointsPerDollar} point</span> per $1. First
                  purchase bonus: <span className="text-se-bone">{LOYALTY.firstPurchaseBonusPoints}</span>.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/10 bg-se-asphalt text-[10px] font-accent tracking-[0.15em] uppercase">
                <Gift className="w-3.5 h-3.5" /> {tier.name}
              </div>
            </div>

            <div className="mt-6">
              {nextTier.next ? (
                <>
                  <div className="flex items-center justify-between text-[11px] text-se-steel font-accent mb-2">
                    <span>
                      Next: <span className="text-se-bone">{nextTier.next.name}</span>
                    </span>
                    <span>{money(nextTier.remainingCents)} to go</span>
                  </div>
                  <div className="h-1.5 bg-se-asphalt overflow-hidden">
                    <div
                      className="h-full bg-se-gold transition-all duration-500"
                      style={{ width: `${Math.round(nextTier.progress * 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="border border-white/5 bg-se-asphalt p-4 text-[13px] text-se-bone/70">
                  You're at our highest tier. Enjoy the VIP treatment.
                </div>
              )}
            </div>

            <div className="mt-6">
              <p className="text-overline mb-3">Your Perks</p>
              <ul className="space-y-2 text-[13px] text-se-bone/70">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <span className="mt-[7px] w-1.5 h-1.5 bg-se-gold shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex gap-3">
              <Link to="/rewards" className="btn-gold text-[10px]">View Rewards</Link>
              <Link to="/contact" className="btn-outline text-[10px]">Support</Link>
              <Link to="/shop" className="btn-outline text-[10px]">Shop</Link>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-7 border border-white/5 bg-se-charcoal p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-overline mb-2">Orders</p>
                <h2 className="font-display text-[18px] tracking-[0.08em]">RECENT PURCHASES</h2>
              </div>
              <Link to="/shop" className="text-[11px] text-se-steel hover:text-se-bone font-accent transition">
                Shop <ChevronRight className="inline w-4 h-4" />
              </Link>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-se-asphalt se-skeleton" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="border border-white/5 bg-se-asphalt p-5 text-[13px] text-se-bone/50">
                  No orders yet. When you place your first order, it will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div
                      key={o.order_number || o.created_at}
                      className="flex items-center justify-between gap-4 border border-white/5 px-4 py-3"
                    >
                      <div>
                        <div className="text-[13px] font-accent text-se-bone">
                          Order {o.order_number || "—"}
                        </div>
                        <div className="text-[11px] text-se-steel font-accent mt-1">
                          {niceDate(o.created_at)} · {String(o.status || "paid").toUpperCase()}
                        </div>
                      </div>
                      <div className="text-[13px] font-accent text-se-bone">
                        {money(o.amount_total)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, loading: isLoading }) {
  const CardIcon = icon;
  return (
    <div className="border border-white/5 bg-se-charcoal p-5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-se-steel font-accent">
        <CardIcon className="w-4 h-4" /> {label}
      </div>
      <div className="mt-3 text-[18px] font-display tracking-[0.04em]">
        {isLoading ? "—" : value}
      </div>
      <div className="mt-1 text-[11px] text-se-steel font-accent">{sub}</div>
    </div>
  );
}
