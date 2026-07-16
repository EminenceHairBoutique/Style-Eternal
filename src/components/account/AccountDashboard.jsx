import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Crown, Receipt, Sparkles, Gift, LogOut, ChevronRight, Star, Zap,
  Heart, ShoppingBag, RotateCcw, Lock, Clock, Check, Truck, X,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import { useUser } from "../../context/UserContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useProducts } from "../../context/ProductsContext";
import { useAllDrops } from "../../hooks/useDrops";
import {
  LOYALTY, nextTierInfo, tierForSpendCents, pointsForPurchaseCents,
} from "../../utils/loyalty";
import { buildAiCatalog } from "../../utils/aiCatalog";
import { resolveProductImages } from "../../utils/productMedia";

// Cents-denominated money (amount_total, lifetime_spend_cents, tier thresholds).
import { formatMoney, formatMoneyCents as money } from "../../utils/format";

const niceDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return iso; }
};

const tierClass = (name) =>
  name === "Foundation" ? "tier-foundation"
    : name === "Established" ? "tier-established"
      : name === "Permanent" ? "tier-permanent"
        : "tier-eternal";

// Visual status badge for an order.
const STATUS_STYLE = {
  paid: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  fulfilled: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  shipped: "text-sky-300 border-sky-400/30 bg-sky-400/10",
  pending: "text-amber-300 border-amber-400/30 bg-amber-400/10",
  processing: "text-amber-300 border-amber-400/30 bg-amber-400/10",
  refunded: "text-se-steel border-white/15 bg-white/5",
  cancelled: "text-red-300 border-red-400/30 bg-red-400/10",
};

export default function AccountDashboard() {
  const { user, logout } = useUser();
  const wishlistCtx = useWishlist();
  const { addToCart } = useCart();
  const { products: catalog } = useProducts();
  const { drops: allDrops } = useAllDrops();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [returns, setReturns] = useState([]);
  const [returnOrder, setReturnOrder] = useState(null); // order being returned

  // For You (AI) state.
  const [forYou, setForYou] = useState(null); // null | product[]
  const [forYouLoading, setForYouLoading] = useState(false);

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

        const ordersSelect =
          "id, order_number, created_at, amount_total, currency, status, " +
          "tracking_number, tracking_carrier, tracking_url, shipped_at, " +
          "order_items(product_name, variant, quantity, unit_price, product_id)";

        let { data: ord, error: ordErr } = await supabase
          .from("orders")
          .select(ordersSelect)
          .order("created_at", { ascending: false })
          .limit(24)
          .eq("user_id", user.id);

        if (ordErr && user.email) {
          const fallback = await supabase
            .from("orders")
            .select(ordersSelect)
            .eq("email", user.email)
            .order("created_at", { ascending: false })
            .limit(24);
          ord = fallback.data || [];
          ordErr = fallback.error || null;
        }

        // Existing return requests (table may not exist pre-RUNBOOK — ignore errors).
        let rets = [];
        try {
          const { data: retData } = await supabase
            .from("returns")
            .select("id, order_id, status, created_at")
            .eq("user_id", user.id);
          rets = retData || [];
        } catch { /* graceful */ }

        if (!cancelled) {
          if (profErr) setError(profErr.message || "Failed to load profile.");
          if (ordErr) setError((prev) => prev || ordErr.message || "Failed to load orders.");
          setProfile(prof || null);
          setOrders(ord || []);
          setReturns(rets);
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
  const tierIndex = useMemo(
    () => LOYALTY.tiers.findIndex((t) => t.name === tier.name),
    [tier]
  );

  // Catalog lookups for reorder + matching order items to imagery.
  const bySlug = useMemo(() => new Map(catalog.map((p) => [p.slug, p])), [catalog]);

  // Wishlist entries hydrated from the persistent slug list.
  const wishlist = useMemo(
    () =>
      wishlistCtx.slugs
        .map((slug) => bySlug.get(slug))
        .filter(Boolean)
        .map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.displayName || p.name,
          price: p.price,
          image: resolveProductImages(p)?.[0] || null,
        })),
    [wishlistCtx.slugs, bySlug]
  );
  const byName = useMemo(
    () => new Map(catalog.map((p) => [(p.displayName || p.name || "").toLowerCase(), p])),
    [catalog]
  );
  const matchItem = (it) =>
    byName.get(String(it.product_name || "").toLowerCase()) ||
    catalog.find((p) => p.id === it.product_id) ||
    null;

  // Points history derived from orders (each verified order earned points).
  const pointsHistory = useMemo(() => {
    const rows = orders
      .filter((o) => Number(o.amount_total || 0) > 0)
      .map((o) => ({
        label: `Order ${o.order_number || "—"}`,
        date: o.created_at,
        points: pointsForPurchaseCents(o.amount_total),
      }));
    if (profile?.first_purchase_bonus_awarded) {
      rows.push({
        label: "Welcome bonus",
        date: null,
        points: LOYALTY.firstPurchaseBonusPoints,
      });
    }
    return rows;
  }, [orders, profile]);

  // Reorder: add every matched line item back to the cart.
  const reorder = (o) => {
    const items = o.order_items || [];
    let added = 0;
    items.forEach((it) => {
      const p = matchItem(it);
      if (!p) return;
      const size = (it.variant || "").split(/[/·|]/)[0]?.trim() || null;
      addToCart(p, {
        size,
        quantity: Number(it.quantity || 1),
        price: Number(p.price ?? it.unit_price ?? 0),
        image: resolveProductImages(p)?.[0] || null,
      });
      added += 1;
    });
    if (!added && items[0]) {
      // Nothing matched the live catalog — send them to the shop.
      window.location.assign("/shop");
    }
  };

  const moveToCart = (w) => {
    const p = bySlug.get(w.slug);
    addToCart(p || { id: w.id, slug: w.slug, name: w.name, price: w.price, image: w.image }, {
      price: Number((p?.price ?? w.price) || 0),
      image: (p && resolveProductImages(p)?.[0]) || w.image || null,
      quantity: 1,
    });
  };

  // Upcoming drops (release in the future) for the early-access panel.
  const upcomingDrops = useMemo(() => {
    const now = Date.now();
    return (allDrops || [])
      .filter((d) => d.release_at && new Date(d.release_at).getTime() > now)
      .slice(0, 4);
  }, [allDrops]);
  const hasEarlyAccess = tierIndex >= 1; // Established and above

  // Fetch personalized picks once the catalog + signals are ready.
  useEffect(() => {
    if (tab !== "overview" || forYou !== null || forYouLoading) return;
    if (!catalog.length) return;

    const signals = [
      ...wishlist.map((w) => w.name),
      ...orders.flatMap((o) => (o.order_items || []).map((i) => i.product_name)),
    ].filter(Boolean).slice(0, 8);

    const fallback = () => catalog.filter((p) => !p.comingSoon).slice(0, 4);

    setForYouLoading(true);
    (async () => {
      try {
        const query = signals.length
          ? `Pieces that complete the wardrobe of someone who owns: ${signals.join(", ")}`
          : "Signature heavyweight essentials to start a Style Eternal wardrobe";
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "search", query, products: buildAiCatalog() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "failed");
        const picks = (data.slugs || []).map((s) => bySlug.get(s)).filter(Boolean);
        setForYou(picks.length ? picks.slice(0, 4) : fallback());
      } catch {
        setForYou(fallback()); // graceful: curated catalog picks
      } finally {
        setForYouLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, catalog.length, orders, wishlist.length]);

  const tabs = [
    { key: "overview", label: "Overview", icon: Crown },
    { key: "orders", label: "Orders", icon: Receipt, count: orders.length },
    { key: "wishlist", label: "Wishlist", icon: Heart, count: wishlist.length },
  ];

  return (
    <div className="bg-se-black text-se-bone min-h-screen pt-28 pb-24">
      <div className="content-wide">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10"
        >
          <div>
            <p className="section-eyebrow mb-3">My Account</p>
            <h1 className="font-display text-[clamp(1.8rem,5vw,3rem)] tracking-[0.04em]">
              {user?.email ? "WELCOME BACK" : "MY ACCOUNT"}
            </h1>
            {user?.email && (
              <p className="text-[13px] text-se-steel font-accent mt-2">{user.email}</p>
            )}
          </div>

          <button onClick={logout} className="btn-outline inline-flex items-center gap-2" type="button">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </Motion.div>

        {error && (
          <div className="mb-6 border border-red-500/30 bg-red-900/20 px-4 py-3 text-[13px] text-red-300">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Crown} label="Membership" value={tier.name} sub="Lifetime tier" loading={loading} />
          <StatCard icon={Sparkles} label="Points" value={loading ? "—" : points.toLocaleString()} sub="From purchases" />
          <StatCard icon={Receipt} label="Lifetime Spend" value={loading ? "—" : money(lifetimeSpendCents)} sub="Drives your tier" />
          <StatCard icon={ShoppingBag} label="Orders" value={loading ? "—" : orders.length} sub="All-time" />
        </div>

        {/* Tier Visualizer */}
        <TierTrack tier={tier} tierIndex={tierIndex} nextTier={nextTier} />

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-white/10 mb-8 mt-10">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.15em] font-accent transition ${
                  active ? "text-se-gold" : "text-se-steel hover:text-se-bone"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {t.count != null && t.count > 0 && (
                  <span className="text-[9px] text-se-steel">({t.count})</span>
                )}
                {active && (
                  <Motion.span layoutId="acct-tab" className="absolute left-0 right-0 -bottom-px h-px bg-se-gold" />
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <Motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "overview" && (
              <OverviewTab
                tier={tier}
                points={points}
                pointsHistory={pointsHistory}
                forYou={forYou}
                forYouLoading={forYouLoading}
                upcomingDrops={upcomingDrops}
                hasEarlyAccess={hasEarlyAccess}
                nextTier={nextTier}
              />
            )}
            {tab === "orders" && (
              <OrdersTab
                returnsByOrder={new Map(returns.map((r) => [r.order_id, r]))}
                onRequestReturn={setReturnOrder}
                loading={loading}
                orders={orders}
                matchItem={matchItem}
                reorder={reorder}
              />
            )}
            {tab === "wishlist" && (
              <WishlistTab
                wishlist={wishlist}
                bySlug={bySlug}
                moveToCart={moveToCart}
                remove={(w) => wishlistCtx.toggle(w.slug)}
              />
            )}
          </Motion.div>
        </AnimatePresence>
      </div>

      {returnOrder && (
        <ReturnRequestModal
          order={returnOrder}
          user={user}
          onClose={() => setReturnOrder(null)}
          onSubmitted={(newReturn) => {
            setReturns((prev) => [...prev, newReturn]);
            setReturnOrder(null);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Return request modal ---------------- */
function ReturnRequestModal({ order, user, onClose, onSubmitted }) {
  const items = order.order_items || [];
  const [selected, setSelected] = useState(() => new Set(items.map((_, i) => i)));
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggle = (i) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!selected.size) return setError("Select at least one item.");
    if (!reason.trim()) return setError("Tell us briefly why you're returning it.");
    setSaving(true);
    try {
      const returnItems = items
        .filter((_, i) => selected.has(i))
        .map((it) => ({
          product_name: it.product_name,
          variant: it.variant,
          quantity: it.quantity,
        }));

      const { data, error: insErr } = await supabase
        .from("returns")
        .insert({
          order_id: order.id,
          user_id: user.id,
          email: user.email || null,
          items: returnItems,
          reason: reason.trim().slice(0, 1000),
        })
        .select("id, order_id, status, created_at")
        .single();
      if (insErr) throw insErr;
      onSubmitted(data);
    } catch (err) {
      setSaving(false);
      setError(err?.message || "Could not submit the return. Please try again.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Request a return"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={submit}
        className="bg-se-charcoal border border-white/10 max-w-md w-full p-7 space-y-5 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-se-gold font-accent mb-1">
              Return request
            </p>
            <h2 className="font-display text-[17px] tracking-[0.08em]">
              ORDER {order.order_number || ""}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-se-steel hover:text-se-bone transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <span className="block text-[11px] font-accent tracking-[0.15em] uppercase text-se-bone/60">
            Items to return
          </span>
          {items.map((it, i) => (
            <label key={i} className="flex items-center gap-3 border border-white/5 bg-se-black/40 px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.has(i)}
                onChange={() => toggle(i)}
                className="accent-[#C4A35A]"
              />
              <span className="text-[13px] font-accent text-se-bone flex-1 truncate">
                {it.product_name}
                {it.variant ? ` · ${it.variant}` : ""} · ×{it.quantity}
              </span>
            </label>
          ))}
        </div>

        <label className="block">
          <span className="text-[11px] font-accent tracking-[0.15em] uppercase text-se-bone/60">
            Reason
          </span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={1000}
            required
            placeholder="Fit, quality, changed your mind…"
            className="mt-2 w-full bg-se-black border border-white/10 px-4 py-3 text-[14px] text-se-bone focus:outline-none focus:border-se-gold/60 resize-y"
          />
        </label>

        <p className="text-[11px] text-se-steel font-accent leading-relaxed">
          Unworn items with tags qualify within 30 days. We'll review within
          1–2 business days and email next steps.
        </p>

        {error && (
          <p className="text-[12px] text-se-red-bright font-accent" role="alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`btn-primary w-full ${saving ? "opacity-70 cursor-wait" : ""}`}
        >
          {saving ? "Submitting…" : "Submit Return Request"}
        </button>
      </form>
    </div>
  );
}

/* ---------------- Tier visualizer ---------------- */
function TierTrack({ tier, tierIndex, nextTier }) {
  const tiers = LOYALTY.tiers;
  // Overall fill: completed segments + partial progress into the current one.
  const segs = tiers.length - 1;
  const base = segs > 0 ? tierIndex / segs : 0;
  const within = nextTier.next && segs > 0 ? nextTier.progress / segs : 0;
  const fill = Math.min(1, base + within) * 100;

  return (
    <div className="border border-white/5 bg-se-charcoal p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-overline mb-2">Your Status</p>
          <h2 className="font-display text-[18px] tracking-[0.08em]">THE ETERNAL LADDER</h2>
        </div>
        <div className={`tier-badge ${tierClass(tier.name)}`}>
          {tier.name === "Eternal" ? <Star className="w-3.5 h-3.5" /> : <Gift className="w-3.5 h-3.5" />}
          {tier.name}
        </div>
      </div>

      <div className="relative pt-2 pb-1">
        {/* track */}
        <div className="absolute left-0 right-0 top-[22px] h-px bg-white/10" />
        <Motion.div
          className="absolute left-0 top-[22px] h-px bg-se-gold"
          initial={{ width: 0 }}
          animate={{ width: `${fill}%` }}
          transition={{ duration: 0.9, ease: [0.2, 0, 0, 1] }}
        />
        <div className="relative flex justify-between">
          {tiers.map((t, i) => {
            const reached = i <= tierIndex;
            const current = i === tierIndex;
            return (
              <div key={t.name} className="flex flex-col items-center text-center w-1/4">
                <span
                  className={`w-3 h-3 rounded-full border transition ${
                    current
                      ? "bg-se-gold border-se-gold ring-4 ring-se-gold/20"
                      : reached
                        ? "bg-se-gold border-se-gold"
                        : "bg-se-charcoal border-white/20"
                  }`}
                />
                <span className={`mt-3 text-[10px] uppercase tracking-[0.12em] font-accent ${
                  reached ? "text-se-bone" : "text-se-steel"
                }`}>
                  {t.name}
                </span>
                <span className="mt-1 text-[9px] text-se-steel font-accent">
                  {t.minSpendCents === 0 ? "Start" : money(t.minSpendCents)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 text-[13px] text-se-steel">
        {nextTier.next ? (
          <>Spend <span className="text-se-gold">{money(nextTier.remainingCents)}</span> more to reach{" "}
            <span className="text-se-bone">{nextTier.next.name}</span>.</>
        ) : (
          <>You've reached <span className="text-se-gold">Eternal</span> — our highest tier. Enjoy the VIP treatment.</>
        )}
      </div>
    </div>
  );
}

/* ---------------- Overview tab ---------------- */
function OverviewTab({ tier, points, pointsHistory, forYou, forYouLoading, upcomingDrops, hasEarlyAccess, nextTier }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Perks */}
        <div className="lg:col-span-5 border border-white/5 bg-se-charcoal p-6">
          <p className="text-overline mb-2">Your Perks</p>
          <h2 className="font-display text-[18px] tracking-[0.08em] mb-4">{tier.name.toUpperCase()} BENEFITS</h2>
          <ul className="space-y-2.5 text-[13px] text-se-bone/70">
            {tier.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5">
                <Zap size={12} className="text-se-gold mt-[3px] shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-3">
            <Link to="/rewards" className="btn-gold text-[10px]">All Rewards</Link>
            <Link to="/shop" className="btn-outline text-[10px]">Shop</Link>
          </div>
        </div>

        {/* Points */}
        <div className="lg:col-span-7 border border-white/5 bg-se-charcoal p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-overline mb-2">Points</p>
              <h2 className="font-display text-[18px] tracking-[0.08em]">
                {points.toLocaleString()} <span className="text-se-steel text-[13px] font-accent">pts</span>
              </h2>
            </div>
            <p className="text-[11px] text-se-steel font-accent text-right max-w-[180px]">
              Earn {LOYALTY.pointsPerDollar} pt per $1 · {LOYALTY.firstPurchaseBonusPoints} pt welcome bonus
            </p>
          </div>

          <div className="mt-5">
            <p className="text-overline mb-3">History</p>
            {pointsHistory.length === 0 ? (
              <p className="text-[13px] text-se-bone/50 border border-white/5 bg-se-asphalt p-4">
                No points yet. Your first order earns a {LOYALTY.firstPurchaseBonusPoints}-point bonus.
              </p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-auto pr-1">
                {pointsHistory.map((row, i) => (
                  <div key={i} className="flex items-center justify-between border border-white/5 px-3 py-2">
                    <div>
                      <div className="text-[12px] font-accent text-se-bone">{row.label}</div>
                      {row.date && <div className="text-[10px] text-se-steel font-accent">{niceDate(row.date)}</div>}
                    </div>
                    <div className="text-[12px] font-accent text-se-gold">+{row.points.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-white/5 pt-4">
            <p className="text-overline mb-2">What points unlock</p>
            <p className="text-[12px] text-se-bone/60 leading-relaxed">
              Points track your standing and fuel your climb up the Eternal ladder. Every dollar moves
              you toward {nextTier.next ? nextTier.next.name : "Eternal"} — unlocking earlier access,
              free shipping, and concierge styling along the way.
            </p>
          </div>
        </div>
      </div>

      {/* Early access */}
      <div className="border border-white/5 bg-se-charcoal p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-overline mb-2">Members</p>
            <h2 className="font-display text-[18px] tracking-[0.08em]">EARLY ACCESS</h2>
          </div>
          <span className={`tier-badge ${hasEarlyAccess ? "tier-established" : "tier-foundation"}`}>
            {hasEarlyAccess ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {hasEarlyAccess ? "Unlocked" : "Locked"}
          </span>
        </div>

        {!hasEarlyAccess ? (
          <div className="border border-white/5 bg-se-asphalt p-5 text-[13px] text-se-bone/60">
            Reach <span className="text-se-bone">Established</span> ({money(LOYALTY.tiers[1].minSpendCents)} lifetime)
            to shop drops before everyone else.{" "}
            <Link to="/drops" className="text-se-gold hover:underline">See the calendar →</Link>
          </div>
        ) : upcomingDrops.length === 0 ? (
          <div className="border border-white/5 bg-se-asphalt p-5 text-[13px] text-se-bone/60">
            No scheduled drops right now — you'll get first access the moment one lands.{" "}
            <Link to="/drops" className="text-se-gold hover:underline">View drops →</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {upcomingDrops.map((d) => (
              <Link
                key={d.slug}
                to={`/drops/${d.slug}`}
                className="group flex items-center justify-between border border-se-gold/20 bg-se-asphalt hover:bg-se-concrete transition px-4 py-3"
              >
                <div>
                  <div className="text-[13px] font-accent text-se-bone">{d.name}</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-se-gold font-accent mt-1">
                    <Clock className="w-3 h-3" /> {niceDate(d.release_at)} · Early access
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-se-steel group-hover:text-se-gold transition" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* For You — AI picks */}
      <div className="border border-white/5 bg-se-charcoal p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="flex items-center gap-1.5 text-overline mb-2">
              <Sparkles className="w-3 h-3 text-se-gold" /> Curated for you
            </p>
            <h2 className="font-display text-[18px] tracking-[0.08em]">FOR YOU</h2>
          </div>
        </div>

        {forYouLoading || forYou === null ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-[3/4] bg-se-asphalt se-skeleton" />)}
          </div>
        ) : forYou.length === 0 ? (
          <p className="text-[13px] text-se-bone/50">Browse the shop to start building your style profile.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {forYou.map((p) => (
              <Link key={p.id || p.slug} to={`/products/${p.slug}`} className="group block">
                <div className="aspect-[3/4] bg-se-asphalt overflow-hidden">
                  {resolveProductImages(p)?.[0] ? (
                    <img src={resolveProductImages(p)[0]} alt={p.name} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display text-[14px] tracking-[0.2em] text-se-steel">SE</span>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[12px] text-se-bone font-accent">{p.displayName || p.name}</p>
                {p.price != null && <p className="text-[11px] text-se-steel font-accent">${p.price}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Orders tab ---------------- */
// Returns are accepted on paid/processing/shipped/fulfilled orders within 30 days.
const RETURN_WINDOW_DAYS = 30;
function returnEligible(order) {
  const status = String(order.status || "").toLowerCase();
  if (!["paid", "processing", "shipped", "fulfilled"].includes(status)) return false;
  if (!order.created_at || !order.id) return false;
  const ageDays = (Date.now() - new Date(order.created_at).getTime()) / 86_400_000;
  return ageDays <= RETURN_WINDOW_DAYS;
}

function OrdersTab({ loading, orders, matchItem, reorder, returnsByOrder, onRequestReturn }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-se-charcoal se-skeleton" />)}
      </div>
    );
  }
  if (!orders.length) {
    return (
      <div className="border border-white/5 bg-se-charcoal p-8 text-center">
        <ShoppingBag className="w-7 h-7 text-se-steel mx-auto mb-3" />
        <p className="text-[14px] text-se-bone/70">No orders yet.</p>
        <Link to="/shop" className="btn-gold text-[10px] mt-4 inline-block">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const items = o.order_items || [];
        const status = String(o.status || "paid").toLowerCase();
        return (
          <div key={o.order_number || o.created_at} className="border border-white/5 bg-se-charcoal p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-[14px] font-accent text-se-bone">Order {o.order_number || "—"}</div>
                  <div className="text-[11px] text-se-steel font-accent mt-1">{niceDate(o.created_at)}</div>
                </div>
                <span className={`text-[9px] uppercase tracking-[0.12em] font-accent px-2 py-1 border ${
                  STATUS_STYLE[status] || "text-se-steel border-white/15 bg-white/5"
                }`}>
                  {status}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-[14px] font-accent text-se-bone">{money(o.amount_total)}</div>
                <button
                  type="button"
                  onClick={() => reorder(o)}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] font-accent border border-se-gold/40 text-se-gold hover:border-se-gold px-3 py-1.5 transition"
                >
                  <RotateCcw className="w-3 h-3" /> Reorder
                </button>
              </div>
            </div>

            {(o.tracking_url || o.tracking_number || returnsByOrder?.get(o.id) || returnEligible(o)) && (
              <div className="mt-3 flex items-center gap-4 flex-wrap text-[11px] font-accent">
                {o.tracking_url ? (
                  <a
                    href={o.tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-se-gold hover:text-se-bone transition underline underline-offset-2"
                  >
                    <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                    Track shipment{o.tracking_carrier ? ` (${o.tracking_carrier.toUpperCase()})` : ""}
                  </a>
                ) : o.tracking_number ? (
                  <span className="inline-flex items-center gap-1.5 text-se-bone/60">
                    <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                    Tracking {o.tracking_number}
                  </span>
                ) : null}

                {returnsByOrder?.get(o.id) ? (
                  <span className="text-se-steel">
                    Return {returnsByOrder.get(o.id).status}
                  </span>
                ) : returnEligible(o) ? (
                  <button
                    type="button"
                    onClick={() => onRequestReturn(o)}
                    className="text-se-steel hover:text-se-bone transition underline underline-offset-2"
                  >
                    Request return
                  </button>
                ) : null}
              </div>
            )}

            {items.length > 0 && (
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                {items.slice(0, 6).map((it, idx) => {
                  const p = matchItem(it);
                  const img = p ? resolveProductImages(p)?.[0] : null;
                  const inner = (
                    <div className="flex items-center gap-2 border border-white/5 bg-se-asphalt pr-3">
                      <div className="w-10 h-12 bg-se-concrete overflow-hidden shrink-0">
                        {img ? (
                          <img src={img} alt={it.product_name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-display text-[9px] tracking-[0.15em] text-se-steel">SE</span>
                          </div>
                        )}
                      </div>
                      <div className="py-1">
                        <div className="text-[11px] font-accent text-se-bone leading-tight max-w-[160px] truncate">
                          {it.product_name}
                        </div>
                        <div className="text-[10px] text-se-steel font-accent">
                          {it.variant ? `${it.variant} · ` : ""}×{it.quantity}
                        </div>
                      </div>
                    </div>
                  );
                  return p ? (
                    <Link key={idx} to={`/products/${p.slug}`}>{inner}</Link>
                  ) : (
                    <div key={idx}>{inner}</div>
                  );
                })}
                {items.length > 6 && (
                  <span className="text-[11px] text-se-steel font-accent">+{items.length - 6} more</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Wishlist tab ---------------- */
function WishlistTab({ wishlist, bySlug, moveToCart, remove }) {
  if (!wishlist.length) {
    return (
      <div className="border border-white/5 bg-se-charcoal p-8 text-center">
        <Heart className="w-7 h-7 text-se-steel mx-auto mb-3" />
        <p className="text-[14px] text-se-bone/70">Your wishlist is empty.</p>
        <p className="text-[12px] text-se-steel font-accent mt-1">Tap the heart on any product to save it here.</p>
        <Link to="/shop" className="btn-gold text-[10px] mt-4 inline-block">Browse the shop</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {wishlist.map((w) => {
        const p = bySlug.get(w.slug);
        const img = (p && resolveProductImages(p)?.[0]) || w.image || null;
        const price = (p?.price ?? w.price);
        return (
          <div key={w.id || w.slug} className="group border border-white/5 bg-se-charcoal overflow-hidden">
            <Link to={`/products/${w.slug}`} className="block aspect-[3/4] bg-se-asphalt overflow-hidden">
              {img ? (
                <img src={img} alt={w.name} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-[14px] tracking-[0.2em] text-se-steel">SE</span>
                </div>
              )}
            </Link>
            <div className="p-3">
              <Link to={`/products/${w.slug}`} className="text-[12px] text-se-bone font-accent hover:text-se-gold transition line-clamp-1">
                {w.name}
              </Link>
              {price != null && (
                <p className="text-[11px] text-se-steel font-accent mt-0.5">{formatMoney(price)}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveToCart(w)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-[0.12em] font-accent bg-se-gold text-se-black hover:bg-se-gold/90 px-2 py-2 transition"
                >
                  <ShoppingBag className="w-3 h-3" /> Add
                </button>
                <button
                  type="button"
                  onClick={() => remove(w)}
                  aria-label="Remove from wishlist"
                  className="p-2 border border-white/10 text-se-steel hover:text-red-300 hover:border-red-400/30 transition"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard(props) {
  const Icon = props.icon;
  return (
    <div className="stat-card-elevated">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-se-steel font-accent">
        <Icon className="w-4 h-4" /> {props.label}
      </div>
      <div className="mt-3 text-[22px] font-display tracking-[0.04em]">
        {props.loading ? "—" : props.value}
      </div>
      <div className="mt-1 text-[11px] text-se-steel font-accent">{props.sub}</div>
    </div>
  );
}
