import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import AdminTable from "./components/AdminTable";
import { useAdminToast } from "./components/Toast";

const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function AdminCustomers() {
  const navigate = useNavigate();
  const { showToast } = useAdminToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      // Pull profiles + aggregate orders client-side. Two round-trips beats
      // a brittle RPC for an admin-only view.
      const [profilesRes, ordersRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("user_id, total, status, customer_email, customer_name"),
      ]);
      if (profilesRes.error) {
        showToast(profilesRes.error.message, "error");
        setLoading(false);
        return;
      }
      if (ordersRes.error) {
        showToast(ordersRes.error.message, "error");
      }

      const orders = (ordersRes.data || []).filter((o) => o.status !== "cancelled");
      const aggByUser = new Map();
      for (const o of orders) {
        if (!o.user_id) continue;
        const cur = aggByUser.get(o.user_id) || { count: 0, total: 0 };
        cur.count += 1;
        cur.total += Number(o.total || 0);
        aggByUser.set(o.user_id, cur);
      }

      const profiles = profilesRes.data || [];
      const profileIds = new Set(profiles.map((p) => p.id));

      // Guest checkouts: build pseudo-rows keyed by email when there is no profile.
      const guestByEmail = new Map();
      for (const o of orders) {
        if (o.user_id && profileIds.has(o.user_id)) continue;
        const key = (o.customer_email || "").toLowerCase();
        if (!key) continue;
        const cur = guestByEmail.get(key) || {
          id: `guest:${key}`,
          full_name: o.customer_name || "",
          email: o.customer_email,
          created_at: null,
          count: 0,
          total: 0,
          guest: true,
        };
        cur.count += 1;
        cur.total += Number(o.total || 0);
        guestByEmail.set(key, cur);
      }

      const merged = [
        ...profiles.map((p) => {
          const agg = aggByUser.get(p.id) || { count: 0, total: 0 };
          return { ...p, totalOrders: agg.count, totalSpent: agg.total };
        }),
        ...Array.from(guestByEmail.values()).map((g) => ({
          id: g.id,
          full_name: g.full_name,
          email: g.email,
          created_at: g.created_at,
          totalOrders: g.count,
          totalSpent: g.total,
          guest: true,
        })),
      ];

      setRows(merged);
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.full_name || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const columns = [
    {
      key: "full_name",
      label: "Name",
      sortable: true,
      render: (r) => (
        <span>
          {r.full_name || "—"}
          {r.guest && (
            <span style={{ marginLeft: 6, fontSize: "0.7rem", color: "#9a9a9a" }}>(guest)</span>
          )}
        </span>
      ),
    },
    { key: "email", label: "Email", sortable: true, render: (r) => r.email || "—" },
    { key: "totalOrders", label: "Orders", sortable: true, render: (r) => r.totalOrders },
    { key: "totalSpent", label: "Spent", sortable: true, render: (r) => USD.format(r.totalSpent) },
    {
      key: "created_at",
      label: "Joined",
      sortable: true,
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"),
    },
  ];

  return (
    <AdminTable
      columns={columns}
      rows={filtered}
      loading={loading}
      onRowClick={(r) => !r.guest && navigate(`/admin/customers/${r.id}`)}
      search={{ value: search, onChange: setSearch, placeholder: "Search by name or email…" }}
      defaultSort={{ key: "totalSpent", dir: "desc" }}
      emptyState={{ title: "No customers yet", subtext: "Customer profiles appear after their first order." }}
    />
  );
}
