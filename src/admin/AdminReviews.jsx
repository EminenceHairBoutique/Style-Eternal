import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AdminTable from "./components/AdminTable";
import StatusBadge from "./components/StatusBadge";
import { useAdminToast } from "./components/Toast";

const mediaUrl = (path) =>
  supabase?.storage.from("review-media").getPublicUrl(path)?.data?.publicUrl || null;

function MediaStrip({ media }) {
  const entries = (Array.isArray(media) ? media : [])
    .map((m) => ({ ...m, url: mediaUrl(m.path) }))
    .filter((m) => m.url);
  if (!entries.length) return null;
  return (
    <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.35rem" }}>
      {entries.map((m, i) => (
        <a key={i} href={m.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          {m.type === "video" ? (
            <span style={{ display: "inline-block", padding: "0.35rem 0.5rem", border: "0.5px solid #d6d3cc", fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6b6b" }}>
              ▶ Video
            </span>
          ) : (
            <img src={m.url} alt="" style={{ width: 34, height: 34, objectFit: "cover", border: "0.5px solid #d6d3cc" }} />
          )}
        </a>
      ))}
    </div>
  );
}

const Stars = ({ n }) => (
  <span style={{ color: "#c9a96e", letterSpacing: "2px", fontSize: "0.8rem" }} aria-label={`${n} out of 5 stars`}>
    {"★".repeat(n)}
    <span style={{ color: "#d6d3cc" }}>{"★".repeat(5 - n)}</span>
  </span>
);

export default function AdminReviews() {
  const { showToast } = useAdminToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      // Table may not exist until the RUNBOOK migrations are applied.
      showToast(error.message, "error");
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

  const setStatus = async (row, status) => {
    setBusyId(row.id);
    const { error } = await supabase.from("reviews").update({ status }).eq("id", row.id);
    setBusyId(null);
    if (error) return showToast(error.message, "error");
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
    showToast(`Review ${status}`);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (r.product_slug || "").toLowerCase().includes(q) ||
        (r.title || "").toLowerCase().includes(q) ||
        (r.body || "").toLowerCase().includes(q) ||
        (r.author_name || "").toLowerCase().includes(q)
      );
    });
  }, [rows, statusFilter, search]);

  const columns = [
    {
      key: "product_slug",
      label: "Product",
      sortable: true,
      render: (r) => (
        <a
          href={`/products/${r.product_slug}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ color: "#1a1a1a", borderBottom: "0.5px solid #c9a96e", textDecoration: "none", fontSize: "0.82rem" }}
        >
          {r.product_slug}
        </a>
      ),
    },
    { key: "rating", label: "Rating", sortable: true, render: (r) => <Stars n={Number(r.rating) || 0} /> },
    {
      key: "body",
      label: "Review",
      render: (r) => (
        <div style={{ maxWidth: 420 }}>
          {r.title && <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{r.title}</div>}
          <div style={{ fontSize: "0.8rem", color: "#6b6b6b", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {r.body || "—"}
          </div>
          {r.verified_purchase && (
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a6310" }}>
              Verified purchase
            </span>
          )}
          <MediaStrip media={r.media} />
        </div>
      ),
    },
    { key: "author_name", label: "Author", render: (r) => r.author_name || "—" },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {r.status !== "approved" && (
            <button
              type="button"
              disabled={busyId === r.id}
              onClick={(e) => { e.stopPropagation(); setStatus(r, "approved"); }}
              style={{ fontSize: "0.72rem", padding: "0.3rem 0.7rem", border: "0.5px solid #b7d3b0", background: "#eef7ec", color: "#2c6b2f", cursor: "pointer" }}
            >
              Approve
            </button>
          )}
          {r.status !== "rejected" && (
            <button
              type="button"
              disabled={busyId === r.id}
              onClick={(e) => { e.stopPropagation(); setStatus(r, "rejected"); }}
              style={{ fontSize: "0.72rem", padding: "0.3rem 0.7rem", border: "0.5px solid #e3b8b8", background: "#fbeeee", color: "#8b2020", cursor: "pointer" }}
            >
              Reject
            </button>
          )}
        </div>
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
      search={{ value: search, onChange: setSearch, placeholder: "Search product, title, text…" }}
      filters={[
        {
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
            { label: "All", value: "all" },
          ],
        },
      ]}
      defaultSort={{ key: "created_at", dir: "desc" }}
      emptyState={{
        title: "No reviews",
        subtext: "Customer reviews appear here for moderation before going live.",
      }}
    />
  );
}
