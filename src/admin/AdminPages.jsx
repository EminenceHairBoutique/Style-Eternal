import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import AdminTable from "./components/AdminTable";
import { useAdminToast } from "./components/Toast";

export default function AdminPages() {
  const navigate = useNavigate();
  const { showToast } = useAdminToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("page_key, title, blocks, updated_at")
        .order("page_key", { ascending: true });
      if (error) showToast(error.message, "error");
      else setRows(data || []);
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, []);

  const columns = [
    {
      key: "title",
      label: "Page",
      sortable: true,
      render: (r) => (
        <Link to={`/admin/pages/${r.page_key}`} style={{ color: "#1a1a1a", textDecoration: "none", borderBottom: "0.5px solid #c9a96e" }}>
          {r.title || r.page_key}
        </Link>
      ),
    },
    {
      key: "page_key",
      label: "Key",
      sortable: true,
      render: (r) => <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#6b6b6b" }}>{r.page_key}</span>,
    },
    {
      key: "blocks",
      label: "Blocks",
      render: (r) => (Array.isArray(r.blocks) ? r.blocks.length : 0),
    },
    {
      key: "updated_at",
      label: "Last updated",
      sortable: true,
      render: (r) => (r.updated_at ? new Date(r.updated_at).toLocaleString() : "—"),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <Link to={`/admin/pages/${r.page_key}`} onClick={(e) => e.stopPropagation()} style={{ fontSize: "0.8rem", color: "#1a1a1a", textDecoration: "underline" }}>
          Edit
        </Link>
      ),
    },
  ];

  return (
    <AdminTable
      columns={columns}
      rows={rows}
      loading={loading}
      onRowClick={(r) => navigate(`/admin/pages/${r.page_key}`)}
      defaultSort={{ key: "page_key", dir: "asc" }}
      emptyState={{ title: "No editable pages", subtext: "Run the page_content migration to seed editable pages." }}
    />
  );
}
