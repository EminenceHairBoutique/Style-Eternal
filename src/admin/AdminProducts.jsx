import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import AdminTable from "./components/AdminTable";
import StatusBadge from "./components/StatusBadge";
import InlineEditCell from "./components/InlineEditCell";
import { useAdminToast } from "./components/Toast";

const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const isLowStock = (r) =>
  Number(r.stock ?? 0) <= Number(r.low_stock_threshold ?? 5);

export default function AdminProducts() {
  const navigate = useNavigate();
  const { showToast } = useAdminToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const load = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, stock, low_stock_threshold, images, is_active, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      showToast(error.message, "error");
    } else {
      setRows(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter === "active" && !r.is_active) return false;
      if (statusFilter === "inactive" && r.is_active) return false;
      if (lowStockOnly && !isLowStock(r)) return false;
      if (q && !(r.name || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, statusFilter, lowStockOnly]);

  const lowStockCount = useMemo(() => rows.filter(isLowStock).length, [rows]);

  const toggleActive = async (row, e) => {
    e.stopPropagation();
    const { error } = await supabase
      .from("products")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);
    if (error) return showToast(error.message, "error");
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_active: !row.is_active } : r)));
    showToast(`Product ${!row.is_active ? "activated" : "deactivated"}`);
  };

  // Inline save for an arbitrary column. Optimistically updates local state,
  // reverts on error, and surfaces a toast either way. Throws on failure so
  // InlineEditCell reverts its own draft.
  const saveField = async (row, field, value) => {
    const { error } = await supabase
      .from("products")
      .update({ [field]: value })
      .eq("id", row.id);
    if (error) {
      showToast(error.message, "error");
      throw error;
    }
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, [field]: value } : r)));
    showToast(`${row.name}: ${field === "price" ? "price" : "stock"} updated`);
  };

  const columns = [
    {
      key: "thumb",
      label: "",
      width: "56px",
      render: (r) => {
        const img = Array.isArray(r.images) ? r.images[0] : null;
        return (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 4,
              background: img ? `url(${img}) center/cover no-repeat` : "#f0eeea",
              border: "0.5px solid #e5e3de",
            }}
          />
        );
      },
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (r) => (
        <Link to={`/admin/products/${r.id}`} style={{ color: "#1a1a1a", textDecoration: "none", borderBottom: "0.5px solid #c9a96e" }}>
          {r.name}
        </Link>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (r) => (
        <InlineEditCell
          value={Number(r.price || 0)}
          type="number"
          min={0}
          step="0.01"
          format={(v) => USD.format(Number(v || 0))}
          onSave={(v) => saveField(r, "price", v)}
        />
      ),
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <InlineEditCell
            value={Number(r.stock ?? 0)}
            type="number"
            min={0}
            step="1"
            onSave={(v) => saveField(r, "stock", v)}
          />
          {isLowStock(r) && (
            <span
              title={`At or below threshold (${r.low_stock_threshold ?? 5})`}
              style={{
                fontSize: "0.62rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: "#8a6310",
                background: "#fbf1d9",
                border: "0.5px solid #ecdca0",
                borderRadius: 999,
                padding: "1px 6px",
                whiteSpace: "nowrap",
              }}
            >
              LOW
            </span>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      render: (r) => <StatusBadge status={r.is_active ? "active" : "inactive"} />,
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div style={{ display: "flex", gap: "0.5rem" }} onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/admin/products/${r.id}`}
            style={{ fontSize: "0.8rem", color: "#1a1a1a", textDecoration: "underline" }}
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={(e) => toggleActive(r, e)}
            style={{
              background: "transparent",
              border: "0.5px solid #d6d3cc",
              padding: "0.25rem 0.5rem",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            {r.is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminTable
      columns={columns}
      rows={filtered}
      loading={loading}
      onRowClick={(r) => navigate(`/admin/products/${r.id}`)}
      search={{ value: search, onChange: setSearch, placeholder: "Search products…" }}
      filters={[
        {
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { label: "All statuses", value: "all" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ],
        },
      ]}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.78rem",
              color: lowStockOnly ? "#8a6310" : "#6b6b6b",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            Low stock only
            {lowStockCount > 0 && (
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 600,
                  color: "#8a6310",
                  background: "#fbf1d9",
                  border: "0.5px solid #ecdca0",
                  borderRadius: 999,
                  padding: "1px 6px",
                }}
              >
                {lowStockCount}
              </span>
            )}
          </label>
          <Link
            to="/admin/products/new"
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
            + Add product
          </Link>
        </div>
      }
      defaultSort={{ key: "created_at", dir: "desc" }}
      emptyState={{ title: "No products yet", subtext: "Create your first product to get started." }}
    />
  );
}
