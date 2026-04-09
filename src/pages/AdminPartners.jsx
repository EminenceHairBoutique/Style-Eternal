import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";
import SEO from "../components/SEO";

const Badge = ({ children, tone = "neutral" }) => {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : tone === "danger"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-neutral-200 bg-neutral-50 text-neutral-700";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${toneClass}`}>
      {children}
    </span>
  );
};

function statusTone(status) {
  const normalizedStatus = String(status || "").toLowerCase();
  if (normalizedStatus === "approved") return "success";
  if (normalizedStatus === "pending") return "warn";
  if (normalizedStatus === "rejected") return "danger";
  return "neutral";
}

export default function AdminPartners() {
  const { user, loading } = useUser();
  const [applications, setApplications] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [onlyPending, setOnlyPending] = useState(true);

  const filtered = useMemo(() => {
    if (!onlyPending) return applications;
    return applications.filter((a) => String(a.status || "").toLowerCase() === "pending");
  }, [applications, onlyPending]);

  const fetchApps = async () => {
    setFetching(true);
    setError("");

    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes?.data?.session?.access_token;
      if (!token) {
        setError("You must be signed in.");
        setFetching(false);
        return;
      }

      const res = await fetch("/api/admin/partner-applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const responseText = await res.text();
        throw new Error(responseText || "Failed to fetch applications");
      }

      const json = await res.json();
      setApplications(Array.isArray(json.applications) ? json.applications : []);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && user) fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id]);

  const updateStatus = async ({ applicationId, action, partnerTier }) => {
    setError("");

    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes?.data?.session?.access_token;
      if (!token) throw new Error("You must be signed in.");

      const res = await fetch("/api/admin/partner-application-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId, action, partnerTier }),
      });

      if (!res.ok) {
        const responseText = await res.text();
        throw new Error(responseText || "Update failed");
      }

      // Refresh list
      await fetchApps();
    } catch (e) {
      setError(String(e?.message || e));
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-[radial-gradient(ellipse_at_top,_#FBF5EC,_#F4EBDF,_#F7F1E7)]">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <SEO title="Admin • Partner Approvals" description="Admin dashboard for partner approvals." />
          <h1 className="text-3xl font-light text-neutral-900">Admin • Partner Approvals</h1>
          <p className="mt-3 text-neutral-700">Please sign in to continue.</p>
          <Link
            to="/account"
            className="inline-flex mt-6 items-center justify-center rounded-full px-6 py-2.5 text-[11px] uppercase tracking-[0.26em] bg-black text-white hover:bg-black/90 transition"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-[radial-gradient(ellipse_at_top,_#FBF5EC,_#F4EBDF,_#F7F1E7)]">
      <SEO title="Admin • Partner Approvals" description="Approve or reject partner applications." />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-[11px] tracking-[0.26em] uppercase text-neutral-500">Admin</p>
            <h1 className="mt-2 text-3xl font-light text-neutral-900">Partner approvals</h1>
            <p className="mt-3 text-sm text-neutral-700 max-w-2xl">
              Approve partner access and unlock the Partner Portal. Access is enforced server-side using the
              <code className="mx-1 px-2 py-0.5 rounded bg-white/70 border border-neutral-200 text-xs">ADMIN_EMAILS</code>
              allowlist.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" checked={onlyPending} onChange={(e) => setOnlyPending(e.target.checked)} />
              Show pending only
            </label>
            <button
              onClick={fetchApps}
              className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-[11px] uppercase tracking-[0.26em] border border-black/15 text-neutral-900 hover:border-black/30 transition"
            >
              {fetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_18px_40px_rgba(15,10,5,0.18)] overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200/80 flex items-center justify-between">
            <p className="text-sm text-neutral-700">
              Showing <span className="font-medium text-neutral-900">{filtered.length}</span> applications
            </p>
            <p className="text-xs text-neutral-500">Newest first</p>
          </div>

          <div className="divide-y divide-neutral-200/80">
            {filtered.map((a) => (
              <ApplicationRow key={a.id} app={a} onUpdate={updateStatus} />
            ))}

            {!filtered.length && (
              <div className="px-6 py-10 text-sm text-neutral-600">
                No applications found.
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-xs text-neutral-500">
          Tip: If a partner applied without creating an account yet, you can approve the application — but portal access
          is granted once the user signs up with the same email.
        </p>
      </div>
    </div>
  );
}

function ApplicationRow({ app, onUpdate }) {
  const [tier, setTier] = useState(app.partner_tier || "wholesale");

  const trackBadge = app.partner_track
    ? { stylist: { label: "Stylist", tone: "warn" }, creator: { label: "Creator", tone: "neutral" } }[
        String(app.partner_track).toLowerCase()
      ] || null
    : null;

  return (
    <div className="px-6 py-5">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-neutral-900 truncate">{app.full_name || "(No name)"}</p>
            <Badge tone={statusTone(app.status)}>{String(app.status || "unknown")}</Badge>
            {trackBadge && <Badge tone={trackBadge.tone}>{trackBadge.label}</Badge>}
            {app.profiles?.account_tier && (
              <Badge>{`Profile: ${app.profiles.account_tier}`}</Badge>
            )}
          </div>

          <p className="mt-2 text-sm text-neutral-700 break-all">{app.email}</p>

          <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-neutral-600">
            {app.business_name && <div><span className="text-neutral-500">Business:</span> {app.business_name}</div>}
            {app.phone && <div><span className="text-neutral-500">Phone:</span> {app.phone}</div>}
            {app.country && <div><span className="text-neutral-500">Country:</span> {app.country}</div>}
            {app.monthly_volume && <div><span className="text-neutral-500">Volume:</span> {app.monthly_volume}</div>}
            {app.install_volume && <div><span className="text-neutral-500">Installs/mo:</span> {app.install_volume}</div>}
            {app.salon_address && <div><span className="text-neutral-500">Salon:</span> {app.salon_address}</div>}
            {app.license_number && <div><span className="text-neutral-500">License:</span> {app.license_number} ({app.license_state || "—"})</div>}
            {app.primary_platform && <div><span className="text-neutral-500">Platform:</span> {app.primary_platform}</div>}
            {app.instagram_handle && <div><span className="text-neutral-500">Instagram:</span> {app.instagram_handle}</div>}
            {app.follower_count && <div><span className="text-neutral-500">Followers:</span> {app.follower_count}</div>}
            {app.interested_in && <div className="sm:col-span-2"><span className="text-neutral-500">Interested in:</span> {app.interested_in}</div>}
            {app.website_or_instagram && (
              <div className="sm:col-span-2 break-all">
                <span className="text-neutral-500">Site/IG:</span> {app.website_or_instagram}
              </div>
            )}
            {app.license_file_url && (
              <div className="sm:col-span-2">
                <span className="text-neutral-500">License file:</span>{" "}
                <a href={app.license_file_url} target="_blank" rel="noreferrer" className="underline">
                  View
                </a>
              </div>
            )}
          </div>

          {app.message && (
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white/70 p-4 text-sm text-neutral-700 whitespace-pre-wrap">
              {app.message}
            </div>
          )}

          <p className="mt-4 text-[11px] text-neutral-500">
            Submitted: {app.created_at ? new Date(app.created_at).toLocaleString() : "—"}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full lg:w-[260px]">
          <label className="block">
            <span className="block text-xs text-neutral-600 mb-1">Partner tier</span>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full px-3 py-3 rounded-2xl border border-neutral-300 bg-white/80 text-sm"
            >
              <optgroup label="Stylist Tiers">
                <option value="registered_stylist">Registered Stylist</option>
                <option value="approved_salon_partner">Approved Salon Partner</option>
                <option value="preferred_salon_partner">Preferred Salon Partner</option>
                <option value="atelier_partner">Atelier Partner</option>
              </optgroup>
              <optgroup label="Creator Tiers">
                <option value="affiliate_creator">Affiliate Creator</option>
                <option value="featured_creator">Featured Creator</option>
                <option value="brand_muse">Brand Muse</option>
              </optgroup>
              <optgroup label="Legacy Tiers">
                <option value="wholesale">Wholesale</option>
                <option value="distributor">Distributor</option>
                <option value="private_label">Private Label</option>
                <option value="vip">VIP</option>
              </optgroup>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdate({ applicationId: app.id, action: "approve", partnerTier: tier })}
              className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-[11px] uppercase tracking-[0.26em] bg-black text-white hover:bg-black/90 transition"
              type="button"
            >
              Approve
            </button>
            <button
              onClick={() => onUpdate({ applicationId: app.id, action: "reject" })}
              className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-[11px] uppercase tracking-[0.26em] border border-black/15 text-neutral-900 hover:border-black/30 transition"
              type="button"
            >
              Reject
            </button>
          </div>

          <button
            onClick={() => onUpdate({ applicationId: app.id, action: "pending" })}
            className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-[11px] uppercase tracking-[0.26em] border border-black/15 text-neutral-900 hover:border-black/30 transition"
            type="button"
          >
            Set pending
          </button>
        </div>
      </div>
    </div>
  );
}
