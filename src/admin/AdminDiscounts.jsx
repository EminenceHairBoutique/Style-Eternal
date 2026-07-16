import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AdminTable from "./components/AdminTable";
import StatusBadge from "./components/StatusBadge";
import ConfirmDialog from "./components/ConfirmDialog";
import { useAdminToast } from "./components/Toast";

const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const EMPTY_FORM = {
  code: "",
  type: "percentage",
  value: "",
  min_order_value: "",
  usage_limit: "",
  expires_at: "",
  is_active: true,
};

export default function AdminDiscounts() {
  const { showToast } = useAdminToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("discount_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) showToast(error.message, "error");
    else setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load();   }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };
  const openEdit = (row) => {
    setForm({
      code: row.code || "",
      type: row.type || "percentage",
      value: row.value ?? "",
      min_order_value: row.min_order_value ?? "",
      usage_limit: row.usage_limit ?? "",
      expires_at: row.expires_at ? row.expires_at.slice(0, 10) : "",
      is_active: !!row.is_active,
    });
    setEditingId(row.id);
    setShowForm(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value) || 0,
      min_order_value: form.min_order_value === "" ? 0 : Number(form.min_order_value),
      usage_limit: form.usage_limit === "" ? null : Number(form.usage_limit),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: !!form.is_active,
    };

    if (!payload.code || !payload.value) {
      setSaving(false);
      return showToast("Code and value are required", "error");
    }

    const query = editingId
      ? supabase.from("discount_codes").update(payload).eq("id", editingId)
      : supabase.from("discount_codes").insert(payload);
    const { error } = await query;
    setSaving(false);
    if (error) return showToast(error.message, "error");
    showToast(editingId ? "Code updated" : "Code created");
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    load();
  };

  const toggleActive = async (row, e) => {
    e.stopPropagation();
    const { error } = await supabase
      .from("discount_codes")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);
    if (error) return showToast(error.message, "error");
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_active: !row.is_active } : r)));
  };

  const onDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.from("discount_codes").delete().eq("id", confirmDelete.id);
    setConfirmDelete(null);
    if (error) return showToast(error.message, "error");
    showToast("Code deleted");
    load();
  };

  const statusOf = (r) => {
    if (!r.is_active) return "inactive";
    if (r.expires_at && new Date(r.expires_at) < new Date()) return "expired";
    if (r.usage_limit != null && r.usage_count >= r.usage_limit) return "expired";
    return "active";
  };

  const columns = useMemo(
    () => [
      { key: "code", label: "Code", sortable: true, render: (r) => <span style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>{r.code}</span> },
      { key: "type", label: "Type", render: (r) => (r.type === "percentage" ? "%" : "$") },
      {
        key: "value",
        label: "Value",
        sortable: true,
        render: (r) =>
          r.type === "percentage" ? `${Number(r.value)}%` : USD.format(Number(r.value || 0)),
      },
      {
        key: "min_order_value",
        label: "Min. order",
        render: (r) =>
          r.min_order_value && Number(r.min_order_value) > 0
            ? USD.format(Number(r.min_order_value))
            : "—",
      },
      {
        key: "usage",
        label: "Usage",
        render: (r) => `${r.usage_count || 0} / ${r.usage_limit ?? "∞"}`,
      },
      {
        key: "expires_at",
        label: "Expires",
        render: (r) => (r.expires_at ? new Date(r.expires_at).toLocaleDateString() : "—"),
      },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={statusOf(r)} /> },
      {
        key: "actions",
        label: "",
        render: (r) => (
          <div style={{ display: "flex", gap: "0.5rem" }} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => openEdit(r)} style={ghostBtnSm}>Edit</button>
            <button type="button" onClick={(e) => toggleActive(r, e)} style={ghostBtnSm}>
              {r.is_active ? "Deactivate" : "Activate"}
            </button>
            <button type="button" onClick={() => setConfirmDelete(r)} style={destructiveLink}>
              Delete
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line
    []
  );

  return (
    <div>
      {showForm && (
        <form onSubmit={onSave} style={cardStyle}>
          <h2 style={sectionTitle}>{editingId ? "Edit discount code" : "Create discount code"}</h2>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.75rem" }}>
            <Field label="Code">
              <input
                required
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                style={inputStyle}
                placeholder="WELCOME10"
              />
            </Field>
            <Field label="Type">
              <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.45rem" }}>
                <label style={radioStyle}>
                  <input type="radio" checked={form.type === "percentage"} onChange={() => set("type", "percentage")} /> %
                </label>
                <label style={radioStyle}>
                  <input type="radio" checked={form.type === "fixed"} onChange={() => set("type", "fixed")} /> Fixed $
                </label>
              </div>
            </Field>
            <Field label={form.type === "percentage" ? "Value (1–100)" : "Value (USD)"}>
              <input
                required
                type="number"
                min={form.type === "percentage" ? 1 : 0}
                max={form.type === "percentage" ? 100 : undefined}
                step="0.01"
                value={form.value}
                onChange={(e) => set("value", e.target.value)}
                style={inputStyle}
              />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <Field label="Minimum order (optional)">
              <input
                type="number"
                step="0.01"
                value={form.min_order_value}
                onChange={(e) => set("min_order_value", e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Usage limit (optional)">
              <input
                type="number"
                value={form.usage_limit}
                onChange={(e) => set("usage_limit", e.target.value)}
                style={inputStyle}
                placeholder="Unlimited"
              />
            </Field>
            <Field label="Expires (optional)">
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => set("expires_at", e.target.value)}
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="">
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => set("is_active", e.target.checked)}
              />
              Active
            </label>
          </Field>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(EMPTY_FORM);
              }}
              style={ghostBtn}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} style={primaryBtn}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Create code"}
            </button>
          </div>
        </form>
      )}

      <AdminTable
        columns={columns}
        rows={rows}
        loading={loading}
        actions={
          !showForm && (
            <button type="button" onClick={openCreate} style={primaryBtn}>
              + Create code
            </button>
          )
        }
        emptyState={{ title: "No codes yet", subtext: "Create your first discount code to share with customers." }}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete discount code?"
        message={confirmDelete ? `Code "${confirmDelete.code}" will be permanently removed.` : ""}
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDelete(null)}
        onConfirm={onDelete}
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "0.75rem" }}>
      {label && <label style={labelStyle}>{label}</label>}
      {children}
    </div>
  );
}

const cardStyle = { background: "#fff", border: "0.5px solid #e5e3de", padding: "1.5rem", marginBottom: "1.25rem" };
const sectionTitle = { margin: "0 0 1rem", fontSize: "0.95rem", color: "#1a1a1a", letterSpacing: "0.02em" };
const labelStyle = { fontSize: "0.75rem", color: "#1a1a1a", fontWeight: 500 };
const inputStyle = { background: "#fff", border: "0.5px solid #d6d3cc", color: "#1a1a1a", padding: "0.55rem 0.7rem", fontSize: "0.9rem", width: "100%" };
const radioStyle = { display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem", cursor: "pointer" };
const primaryBtn = { background: "#c9a96e", color: "#0f0f0f", border: "none", padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer" };
const ghostBtn = { background: "transparent", color: "#1a1a1a", border: "0.5px solid #d6d3cc", padding: "0.55rem 1rem", fontSize: "0.85rem", cursor: "pointer" };
const ghostBtnSm = { background: "transparent", color: "#1a1a1a", border: "0.5px solid #d6d3cc", padding: "0.25rem 0.5rem", fontSize: "0.75rem", cursor: "pointer" };
const destructiveLink = { background: "transparent", border: "none", color: "#c43030", fontSize: "0.78rem", cursor: "pointer", padding: "0.25rem 0.4rem" };
