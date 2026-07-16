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
      <div style={{ fontFamily: "'Oswald Variable', 'Oswald', sans-serif", fontSize: "1.65rem", color: "#1a1a1a" }}>
        {value}
      </div>
      {hint && <div style={{ fontSize: "0.75rem", color: "#9a9a9a", marginTop: "0.25rem" }}>{hint}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
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

        const [recentRes, statRes, productRes] = await Promise.all([
          supabase
            .from("orders")
            .select("id, order_number, customer_name, email, customer_email, amount_total, total, status, created_at, order_items(product_name)")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("orders")
            .select("user_id, amount_total, total, status, created_at")
            .gte("created_at", since),
          supabase
            .from("products")
            .select("id, name, stock, low_stock_threshold")
            .order("stock", { ascending: true })
            .limit(100),
        ]);

        if (cancelled) return;

        if (recentRes.error) throw recentRes.error;
        if (statRes.error) throw statRes.error;
        // Low-stock is non-critical — don't fail the whole dashboard if it errors.
        if (!productRes.error) {
          const low = (productRes.data || []).filter(
            (p) => Number(p.stock ?? 0) <= Number(p.low_stock_threshold ?? 5)
          );
          setLowStock(low);
        }

        setRecentOrders(recentRes.data || []);

        const rows = statRes.data || [];
        const active = rows.filter((o) => o.status !== "cancelled" && o.status !== "refunded");
        // amount_total (cents) is canonical; total (dollars) covers legacy rows.
        const revenue = active.reduce(
          (s, r) => s + (r.amount_total != null ? Number(r.amount_total) / 100 : Number(r.total || 0)),
          0
        );
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

      {!loading && lowStock.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: "0.5px solid #ecdca0",
            borderLeft: "2px solid #c79320",
            padding: "1rem 1.25rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#8a6310",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Low stock alerts
            <span
              style={{
                fontSize: "0.62rem",
                background: "#fbf1d9",
                border: "0.5px solid #ecdca0",
                borderRadius: 999,
                padding: "1px 7px",
              }}
            >
              {lowStock.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {lowStock.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                to={`/admin/products/${p.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85rem",
                  color: "#1a1a1a",
                  textDecoration: "none",
                  padding: "0.3rem 0",
                  borderBottom: "0.5px solid #f0eeea",
                }}
              >
                <span style={{ borderBottom: "0.5px solid #c9a96e" }}>{p.name}</span>
                <span style={{ color: "#8a6310", fontWeight: 600 }}>
                  {p.stock ?? 0} left
                </span>
              </Link>
            ))}
            {lowStock.length > 8 && (
              <Link
                to="/admin/products"
                style={{ fontSize: "0.78rem", color: "#6b6b6b", marginTop: "0.4rem", textDecoration: "underline" }}
              >
                + {lowStock.length - 8} more — view all products
              </Link>
            )}
          </div>
        </div>
      )}

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
                            {o.customer_name || o.email || o.customer_email || "—"}
                          </Link>
                        </td>
                        <td style={cellStyle}>{firstName}{more}</td>
                        <td style={cellStyle}>
                          {USD.format(o.amount_total != null ? Number(o.amount_total) / 100 : Number(o.total || 0))}
                        </td>
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
