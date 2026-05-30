import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import StatusBadge from "./components/StatusBadge";

const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function thirtyDaysAgoISO() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString();
}

function MetricCard({ label, value, hint }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #e5e3de",
        padding: "1.25rem 1.5rem",
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          color: "#6b6b6b",
          textTransform: "uppercase",
          marginBottom: "0.5rem",
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "1.65rem", color: "#1a1a1a" }}>
        {value}
      </div>
      {hint && <div style={{ fontSize: "0.75rem", color: "#9a9a9a", marginTop: "0.25rem" }}>{hint}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, orderCount: 0, customerCount: 0, aov: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const since = thirtyDaysAgoISO();

        const [recentRes, statRes] = await Promise.all([
          supabase
            .from("orders")
            .select("id, customer_name, customer_email, total, status, created_at, order_items(product_name)")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("orders")
            .select("user_id, total, status, created_at")
            .gte("created_at", since),
        ]);

        if (cancelled) return;

        if (recentRes.error) throw recentRes.error;
        if (statRes.error) throw statRes.error;

        setRecentOrders(recentRes.data || []);

        const rows = statRes.data || [];
        const active = rows.filter((o) => o.status !== "cancelled");
        const revenue = active.reduce((s, r) => s + Number(r.total || 0), 0);
        const orderCount = active.length;
        const customerCount = new Set(active.map((r) => r.user_id).filter(Boolean)).size;
        const aov = orderCount > 0 ? revenue / orderCount : 0;
        setStats({ revenue, orderCount, customerCount, aov });
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const metricVals = useMemo(
    () => [
      { label: "Revenue (30d)", value: USD.format(stats.revenue) },
      { label: "Orders (30d)", value: String(stats.orderCount) },
      { label: "Customers", value: String(stats.customerCount), hint: "distinct buyers (30d)" },
      { label: "Avg. order value", value: USD.format(stats.aov) },
    ],
    [stats]
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {metricVals.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      <h2 style={{ fontSize: "0.95rem", margin: "0 0 1rem", color: "#1a1a1a", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        Recent orders
      </h2>

      {error && (
        <div style={{ color: "#c43030", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</div>
      )}

      <div style={{ background: "#fff", border: "0.5px solid #e5e3de" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Customer", "Items", "Total", "Status", "Date"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "0.65rem 0.75rem",
                    fontSize: "0.7rem",
                    letterSpacing: "0.05em",
                    color: "#6b6b6b",
                    textTransform: "uppercase",
                    background: "#fafaf8",
                    borderBottom: "0.5px solid #e5e3de",
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} style={cellStyle}>
                        <span className="admin-skeleton" />
                      </td>
                    ))}
                  </tr>
                ))
              : recentOrders.length === 0
                ? (
                    <tr>
                      <td colSpan={5} style={{ ...cellStyle, textAlign: "center", padding: "2.5rem 1rem", color: "#9a9a9a" }}>
                        No orders yet
                      </td>
                    </tr>
                  )
                : recentOrders.map((o, i) => {
                    const items = o.order_items || [];
                    const firstName = items[0]?.product_name || "—";
                    const more = items.length > 1 ? ` + ${items.length - 1} more` : "";
                    return (
                      <tr key={o.id} style={{ background: i % 2 === 1 ? "#fcfbf9" : "#fff" }}>
                        <td style={cellStyle}>
                          <Link to={`/admin/orders/${o.id}`} style={linkStyle}>
                            {o.customer_name || o.customer_email || "—"}
                          </Link>
                        </td>
                        <td style={cellStyle}>{firstName}{more}</td>
                        <td style={cellStyle}>{USD.format(Number(o.total || 0))}</td>
                        <td style={cellStyle}><StatusBadge status={o.status} /></td>
                        <td style={cellStyle}>
                          {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    );
                  })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cellStyle = {
  padding: "0.65rem 0.75rem",
  fontSize: "0.85rem",
  color: "#1a1a1a",
  borderBottom: "0.5px solid #e5e3de",
};

const linkStyle = {
  color: "#1a1a1a",
  textDecoration: "none",
  borderBottom: "0.5px solid #c9a96e",
};
