import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import StatusBadge from "./components/StatusBadge";
import { useAdminToast } from "./components/Toast";

const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const STATUSES = ["pending", "processing", "fulfilled", "cancelled"];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { showToast } = useAdminToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase || !id) return;
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) showToast(error.message, "error");
      else setOrder(data);
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [id]);

  const updateStatus = async (next) => {
    if (!order) return;
    setSaving(true);
    const { error } = await supabase.from("orders").update({ status: next }).eq("id", id);
    setSaving(false);
    if (error) return showToast(error.message, "error");
    setOrder({ ...order, status: next });
    showToast(`Status updated to ${next}`);
  };

  if (loading) return <div style={{ color: "#6b6b6b" }}>Loading…</div>;
  if (!order) return <div style={{ color: "#6b6b6b" }}>Order not found.</div>;

  const items = order.order_items || [];
  const ship = order.shipping_address || {};

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.25rem", maxWidth: "1080px" }}>
      <div>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <Label>Order</Label>
              <div style={{ fontFamily: "monospace", fontSize: "0.95rem" }}>{String(order.id).slice(0, 12)}</div>
              <div style={{ fontSize: "0.8rem", color: "#9a9a9a", marginTop: "0.25rem" }}>
                {order.created_at ? new Date(order.created_at).toLocaleString() : "—"}
              </div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <hr style={hrStyle} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Label>Total</Label>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "1.5rem" }}>
                {USD.format(Number(order.total || 0))}
              </div>
            </div>
            {order.stripe_payment_id && (
              <a
                href={`https://dashboard.stripe.com/payments/${order.stripe_payment_id}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: "0.8rem", color: "#1a1a1a", borderBottom: "0.5px solid #c9a96e", textDecoration: "none" }}
              >
                View in Stripe →
              </a>
            )}
          </div>
        </Card>

        <Card>
          <Label>Line items</Label>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
            <thead>
              <tr>
                {["Product", "Variant", "Qty", "Unit", "Total"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} style={{ ...tdStyle, color: "#9a9a9a", textAlign: "center" }}>No items</td></tr>
              ) : items.map((it) => (
                <tr key={it.id}>
                  <td style={tdStyle}>{it.product_name}</td>
                  <td style={tdStyle}>{it.variant || "—"}</td>
                  <td style={tdStyle}>{it.quantity}</td>
                  <td style={tdStyle}>{USD.format(Number(it.unit_price || 0))}</td>
                  <td style={tdStyle}>{USD.format(Number(it.line_total || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem", fontSize: "0.85rem", color: "#6b6b6b" }}>
            <div>Subtotal: {USD.format(Number(order.subtotal || 0))}</div>
            <div>Shipping: {USD.format(Number(order.shipping || 0))}</div>
            <div>Tax: {USD.format(Number(order.tax || 0))}</div>
            <div style={{ color: "#1a1a1a", fontWeight: 600 }}>
              Total: {USD.format(Number(order.total || 0))}
            </div>
          </div>
        </Card>
      </div>

      <div>
        <Card>
          <Label>Customer</Label>
          <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>{order.customer_name || "—"}</div>
          <div style={{ fontSize: "0.85rem", color: "#6b6b6b" }}>{order.customer_email || "—"}</div>
          {order.user_id && (
            <Link
              to={`/admin/customers/${order.user_id}`}
              style={{ fontSize: "0.8rem", color: "#1a1a1a", borderBottom: "0.5px solid #c9a96e", textDecoration: "none", marginTop: "0.5rem", display: "inline-block" }}
            >
              View customer →
            </Link>
          )}

          {ship && Object.keys(ship).length > 0 && (
            <>
              <hr style={hrStyle} />
              <Label>Shipping address</Label>
              <div style={{ fontSize: "0.85rem", color: "#1a1a1a", marginTop: "0.4rem", lineHeight: 1.5 }}>
                {ship.line1 && <div>{ship.line1}</div>}
                {ship.line2 && <div>{ship.line2}</div>}
                {(ship.city || ship.state || ship.postalCode) && (
                  <div>{[ship.city, ship.state, ship.postalCode].filter(Boolean).join(", ")}</div>
                )}
                {ship.country && <div>{ship.country}</div>}
              </div>
            </>
          )}
        </Card>

        <Card>
          <Label>Status</Label>
          <select
            value={order.status}
            disabled={saving}
            onChange={(e) => updateStatus(e.target.value)}
            style={{
              marginTop: "0.5rem",
              padding: "0.55rem 0.7rem",
              border: "0.5px solid #d6d3cc",
              background: "#fff",
              fontSize: "0.9rem",
              width: "100%",
              color: "#1a1a1a",
            }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <p style={{ fontSize: "0.75rem", color: "#9a9a9a", marginTop: "0.5rem" }}>
            Pending → Processing → Fulfilled. Cancelled is terminal.
          </p>
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

const hrStyle = { border: "none", borderTop: "0.5px solid #e5e3de", margin: "1rem 0" };

const thStyle = {
  textAlign: "left",
  padding: "0.4rem 0.5rem",
  fontSize: "0.7rem",
  letterSpacing: "0.05em",
  color: "#6b6b6b",
  textTransform: "uppercase",
  borderBottom: "0.5px solid #e5e3de",
  fontWeight: 600,
};

const tdStyle = {
  padding: "0.5rem",
  fontSize: "0.85rem",
  borderBottom: "0.5px solid #f0eeea",
};
