import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import AdminTable from "./components/AdminTable";
import StatusBadge from "./components/StatusBadge";
import { useAdminToast } from "./components/Toast";

const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

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
        .select("id, customer_email, customer_name, total, status, stripe_payment_id, created_at, order_items(product_name)")
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
        (r.customer_email || "").toLowerCase().includes(q) ||
        (r.id || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const columns = [
    {
      key: "id",
      label: "Order",
      sortable: true,
      render: (r) => (
        <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#1a1a1a" }}>
          {String(r.id).slice(0, 8)}
        </span>
      ),
    },
    {
      key: "customer_email",
      label: "Customer",
      sortable: true,
      render: (r) => r.customer_email || r.customer_name || "—",
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
    { key: "total", label: "Total", sortable: true, render: (r) => USD.format(Number(r.total || 0)) },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "stripe_payment_id",
      label: "Stripe",
      render: (r) =>
        r.stripe_payment_id ? (
          <a
            href={`https://dashboard.stripe.com/payments/${r.stripe_payment_id}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#1a1a1a", borderBottom: "0.5px solid #c9a96e", textDecoration: "none" }}
          >
            {r.stripe_payment_id.slice(0, 10)}…
          </a>
        ) : (
          "—"
        ),
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
      search={{ value: search, onChange: setSearch, placeholder: "Search by email or order ID…" }}
      filters={[
        {
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { label: "All statuses", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Processing", value: "processing" },
            { label: "Fulfilled", value: "fulfilled" },
            { label: "Cancelled", value: "cancelled" },
          ],
        },
      ]}
      defaultSort={{ key: "created_at", dir: "desc" }}
      emptyState={{ title: "No orders", subtext: "Orders will appear here as customers check out." }}
    />
  );
}
