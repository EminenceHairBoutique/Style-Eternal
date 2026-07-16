import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import AdminTable from "./components/AdminTable";
import StatusBadge from "./components/StatusBadge";
import { useAdminToast } from "./components/Toast";

async function fulfillmentPost(payload) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  const res = await fetch("/api/admin/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

// Lifecycle: requested → approved/rejected → received → refunded
const NEXT_ACTIONS = {
  requested: ["approved", "rejected"],
  approved: ["received"],
  received: ["refunded"],
  rejected: [],
  refunded: [],
};

export default function AdminReturns() {
  const { showToast } = useAdminToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("requested");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("returns")
      .select("*, orders(order_number)")
      .order("created_at", { ascending: false });
    if (error) {
      showToast(error.message, "error");
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

  const transition = async (row, status) => {
    setBusyId(row.id);
    try {
      const result = await fulfillmentPost({ action: "return-update", returnId: row.id, status });
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
      showToast(result.emailed ? `Return ${status} — customer notified` : `Return ${status}`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (r.email || "").toLowerCase().includes(q) ||
        (r.orders?.order_number || "").toLowerCase().includes(q) ||
        (r.reason || "").toLowerCase().includes(q)
      );
    });
  }, [rows, statusFilter, search]);

  const columns = [
    {
      key: "order",
      label: "Order",
      render: (r) => (
        <Link
          to={`/admin/orders/${r.order_id}`}
          onClick={(e) => e.stopPropagation()}
          style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#1a1a1a", borderBottom: "0.5px solid #c9a96e", textDecoration: "none" }}
        >
          {r.orders?.order_number || String(r.order_id).slice(0, 8)}
        </Link>
      ),
    },
    { key: "email", label: "Customer", sortable: true, render: (r) => r.email || "—" },
    {
      key: "items",
      label: "Items",
      render: (r) => {
        const items = Array.isArray(r.items) ? r.items : [];
        if (!items.length) return "—";
        const first = items[0]?.product_name || items[0]?.name || "—";
        return items.length > 1 ? `${first} + ${items.length - 1} more` : first;
      },
    },
    {
      key: "reason",
      label: "Reason",
      render: (r) => (
        <span style={{ display: "inline-block", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {r.reason || "—"}
        </span>
      ),
    },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div style={{ display: "flex", gap: "0.4rem" }} onClick={(e) => e.stopPropagation()}>
          {(NEXT_ACTIONS[r.status] || []).map((next) => (
            <button
              key={next}
              type="button"
              disabled={busyId === r.id}
              onClick={() => transition(r, next)}
              style={{
                fontSize: "0.72rem",
                padding: "0.3rem 0.7rem",
                border: "0.5px solid #d6d3cc",
                background: next === "rejected" ? "#fbeeee" : "#f4f2ed",
                color: next === "rejected" ? "#8b2020" : "#1a1a1a",
                cursor: "pointer",
              }}
            >
              {next[0].toUpperCase() + next.slice(1)}
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Requested",
      sortable: true,
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"),
    },
  ];

  return (
    <AdminTable
      columns={columns}
      rows={filtered}
      loading={loading}
      search={{ value: search, onChange: setSearch, placeholder: "Search order #, email, reason…" }}
      filters={[
        {
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { label: "Requested", value: "requested" },
            { label: "Approved", value: "approved" },
            { label: "Received", value: "received" },
            { label: "Refunded", value: "refunded" },
            { label: "Rejected", value: "rejected" },
            { label: "All", value: "all" },
          ],
        },
      ]}
      defaultSort={{ key: "created_at", dir: "desc" }}
      emptyState={{
        title: "No returns",
        subtext: "Customer return requests appear here for review.",
      }}
    />
  );
}
