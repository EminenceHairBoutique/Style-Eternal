import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import AdminTable from "./components/AdminTable";
import StatusBadge from "./components/StatusBadge";
import { useAdminToast } from "./components/Toast";

const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// amount_total (cents) is canonical; total (dollars) covers legacy rows.
const orderTotal = (r) =>
  r.amount_total != null ? Number(r.amount_total) / 100 : Number(r.total || 0);

const paymentRef = (r) => r.stripe_payment_intent || r.stripe_payment_id || null;

export default function AdminOrders() {
  const navigate = useNavigate();
  const { showToast } = useAdminToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, email, customer_email, customer_name, amount_total, total, status, stripe_payment_intent, stripe_payment_id, created_at, order_items(product_name)"
        )
        .order("created_at", { ascending: false });
      if (error) showToast(error.message, "error");
      else setRows(data || []);
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (r.email || r.customer_email || "").toLowerCase().includes(q) ||
        (r.order_number || "").toLowerCase().includes(q) ||
        (r.id || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const columns = [
    {
      key: "order_number",
      label: "Order",
      sortable: true,
      render: (r) => (
        <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#1a1a1a" }}>
          {r.order_number || String(r.id).slice(0, 8)}
        </span>
      ),
    },
    {
      key: "email",
      label: "Customer",
      sortable: true,
      render: (r) => r.email || r.customer_email || r.customer_name || "—",
    },
    {
      key: "items",
      label: "Items",
      render: (r) => {
        const items = r.order_items || [];
        if (!items.length) return "—";
        const first = items[0]?.product_name || "—";
        return items.length > 1 ? `${first} + ${items.length - 1} more` : first;
      },
    },
    {
      key: "amount_total",
      label: "Total",
      sortable: true,
      render: (r) => USD.format(orderTotal(r)),
    },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "stripe",
      label: "Stripe",
      render: (r) => {
        const ref = paymentRef(r);
        return ref ? (
          <a
            href={`https://dashboard.stripe.com/payments/${ref}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#1a1a1a", borderBottom: "0.5px solid #c9a96e", textDecoration: "none" }}
          >
            {ref.slice(0, 10)}…
          </a>
        ) : (
          "—"
        );
      },
    },
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"),
    },
  ];

  return (
    <AdminTable
      columns={columns}
      rows={filtered}
      loading={loading}
      onRowClick={(r) => navigate(`/admin/orders/${r.id}`)}
      search={{ value: search, onChange: setSearch, placeholder: "Search by email, order # or ID…" }}
      filters={[
        {
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { label: "All statuses", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Paid", value: "paid" },
            { label: "Processing", value: "processing" },
            { label: "Shipped", value: "shipped" },
            { label: "Fulfilled", value: "fulfilled" },
            { label: "Cancelled", value: "cancelled" },
            { label: "Refunded", value: "refunded" },
          ],
        },
      ]}
      defaultSort={{ key: "created_at", dir: "desc" }}
      emptyState={{ title: "No orders", subtext: "Orders will appear here as customers check out." }}
    />
  );
}
