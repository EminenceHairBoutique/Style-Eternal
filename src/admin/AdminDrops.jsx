import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import AdminTable from "./components/AdminTable";
import StatusBadge from "./components/StatusBadge";
import { useAdminToast } from "./components/Toast";

// Map drop status → StatusBadge tone keys (reusing existing pill colors).
const STATUS_TONE = {
  draft: "inactive",
  scheduled: "pending",
  live: "active",
  archived: "cancelled",
};

export default function AdminDrops() {
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
        .from("drops")
        .select("id, name, slug, status, release_at, sort_order, hero_image, drop_products(count)")
        .order("sort_order", { ascending: true })
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
      if (q && !(r.name || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, statusFilter]);

  const productCount = (r) =>
    Array.isArray(r.drop_products) ? r.drop_products[0]?.count ?? 0 : 0;

  const columns = [
    {
      key: "hero",
      label: "",
      width: "56px",
      render: (r) => (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 4,
            background: r.hero_image ? `url(${r.hero_image}) center/cover no-repeat` : "#f0eeea",
            border: "0.5px solid #e5e3de",
          }}
        />
      ),
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (r) => (
        <Link to={`/admin/drops/${r.id}`} style={{ color: "#1a1a1a", textDecoration: "none", borderBottom: "0.5px solid #c9a96e" }}>
          {r.name}
        </Link>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (r) => <StatusBadge status={STATUS_TONE[r.status] || "inactive"}>{r.status}</StatusBadge>,
    },
    {
      key: "products",
      label: "Products",
      render: (r) => `${productCount(r)}`,
    },
    {
      key: "release_at",
      label: "Release",
      sortable: true,
      render: (r) => (r.release_at ? new Date(r.release_at).toLocaleDateString() : "—"),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <Link
          to={`/admin/drops/${r.id}`}
          onClick={(e) => e.stopPropagation()}
          style={{ fontSize: "0.8rem", color: "#1a1a1a", textDecoration: "underline" }}
        >
          Edit
        </Link>
      ),
    },
  ];

  return (
    <AdminTable
      columns={columns}
      rows={filtered}
      loading={loading}
      onRowClick={(r) => navigate(`/admin/drops/${r.id}`)}
      search={{ value: search, onChange: setSearch, placeholder: "Search drops…" }}
      filters={[
        {
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { label: "All statuses", value: "all" },
            { label: "Draft", value: "draft" },
            { label: "Scheduled", value: "scheduled" },
            { label: "Live", value: "live" },
            { label: "Archived", value: "archived" },
          ],
        },
      ]}
      actions={
        <Link
          to="/admin/drops/new"
          style={{
            background: "#c9a96e",
            color: "#0f0f0f",
            padding: "0.55rem 1rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          + Create drop
        </Link>
      }
      defaultSort={{ key: "release_at", dir: "desc" }}
      emptyState={{ title: "No drops yet", subtext: "Create your first drop to group products into a release." }}
    />
  );
}
