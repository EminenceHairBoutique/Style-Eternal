import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import StatusBadge from "./components/StatusBadge";
import { useAdminToast } from "./components/Toast";

const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const { showToast } = useAdminToast();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !id) return;
    (async () => {
      const [profileRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("orders")
          .select("id, order_number, amount_total, total, status, created_at, order_items(product_name)")
          .eq("user_id", id)
          .order("created_at", { ascending: false }),
      ]);
      if (profileRes.error) showToast(profileRes.error.message, "error");
      if (ordersRes.error) showToast(ordersRes.error.message, "error");
      setProfile(profileRes.data || null);
      setOrders(ordersRes.data || []);
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [id]);

  const stats = useMemo(() => {
    // amount_total (cents) is canonical; total (dollars) covers legacy rows.
    const orderDollars = (o) =>
      o.amount_total != null ? Number(o.amount_total) / 100 : Number(o.total || 0);
    const active = orders.filter((o) => o.status !== "cancelled" && o.status !== "refunded");
    const total = active.reduce((s, o) => s + orderDollars(o), 0);
    const count = active.length;
    return { count, total, aov: count > 0 ? total / count : 0 };
  }, [orders]);

  const toggleAdmin = async () => {
    if (!profile) return;
    const next = !profile.is_admin;
    const { error } = await supabase.from("profiles").update({ is_admin: next }).eq("id", id);
    if (error) return showToast(error.message, "error");
    setProfile({ ...profile, is_admin: next });
    showToast(next ? "Granted admin access" : "Revoked admin access");
  };

  if (loading) return <div style={{ color: "#6b6b6b" }}>Loading…</div>;
  if (!profile) return <div style={{ color: "#6b6b6b" }}>Customer not found.</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.25rem", maxWidth: "1080px" }}>
      <div>
        <Card>
          <Label>Profile</Label>
          <div style={{ marginTop: "0.5rem", fontSize: "1rem" }}>{profile.full_name || "—"}</div>
          <div style={{ fontSize: "0.85rem", color: "#6b6b6b" }}>{profile.email || "—"}</div>
          <div style={{ fontSize: "0.75rem", color: "#9a9a9a", marginTop: "0.5rem" }}>
            Joined {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
          </div>

          <hr style={hrStyle} />
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
            <input type="checkbox" checked={!!profile.is_admin} onChange={toggleAdmin} />
            Admin access
          </label>
        </Card>

        <Card>
          <Label>Lifetime</Label>
          <Stat label="Total orders" value={stats.count} />
          <Stat label="Total spent" value={USD.format(stats.total)} />
          <Stat label="Avg. order value" value={USD.format(stats.aov)} />
        </Card>
      </div>

      <div>
        <Card>
          <Label>Order history</Label>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
            <thead>
              <tr>
                {["Order", "Items", "Total", "Status", "Date"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={5} style={{ ...tdStyle, color: "#9a9a9a", textAlign: "center" }}>No orders yet</td></tr>
              ) : orders.map((o) => {
                const items = o.order_items || [];
                const summary = items.length === 0
                  ? "—"
                  : items.length === 1
                    ? items[0].product_name
                    : `${items[0].product_name} + ${items.length - 1} more`;
                return (
                  <tr key={o.id}>
                    <td style={tdStyle}>
                      <Link to={`/admin/orders/${o.id}`} style={linkStyle}>
                        {o.order_number || String(o.id).slice(0, 8)}
                      </Link>
                    </td>
                    <td style={tdStyle}>{summary}</td>
                    <td style={tdStyle}>
                      {USD.format(o.amount_total != null ? Number(o.amount_total) / 100 : Number(o.total || 0))}
                    </td>
                    <td style={tdStyle}><StatusBadge status={o.status} /></td>
                    <td style={tdStyle}>{o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #e5e3de", padding: "1.25rem", marginBottom: "1rem" }}>
      {children}
    </div>
  );
}
function Label({ children }) {
  return (
    <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "#6b6b6b", textTransform: "uppercase", fontWeight: 600 }}>
      {children}
    </div>
  );
}
function Stat({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.85rem", borderBottom: "0.5px solid #f0eeea" }}>
      <span style={{ color: "#6b6b6b" }}>{label}</span>
      <span style={{ color: "#1a1a1a" }}>{value}</span>
    </div>
  );
}

const hrStyle = { border: "none", borderTop: "0.5px solid #e5e3de", margin: "0.85rem 0" };
const thStyle = { textAlign: "left", padding: "0.4rem 0.5rem", fontSize: "0.7rem", letterSpacing: "0.05em", color: "#6b6b6b", textTransform: "uppercase", borderBottom: "0.5px solid #e5e3de", fontWeight: 600 };
const tdStyle = { padding: "0.5rem", fontSize: "0.85rem", borderBottom: "0.5px solid #f0eeea" };
const linkStyle = { color: "#1a1a1a", textDecoration: "none", borderBottom: "0.5px solid #c9a96e", fontFamily: "monospace", fontSize: "0.78rem" };
