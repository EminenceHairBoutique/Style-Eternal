import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ImageUploader from "./components/ImageUploader";
import { useAdminToast } from "./components/Toast";

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const STATUSES = ["draft", "scheduled", "live", "archived"];

const EMPTY = {
  name: "",
  slug: "",
  description: "",
  hero_image: "",
  status: "draft",
  release_at: "",
  sort_order: 0,
};

export default function AdminDropForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const { showToast } = useAdminToast();

  const [form, setForm] = useState(EMPTY);
  const [allProducts, setAllProducts] = useState([]);
  const [assigned, setAssigned] = useState([]); // [{ product_id, name, image }]
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  // Load all products (for the picker) + the drop being edited.
  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const productsRes = await supabase
        .from("products")
        .select("id, name, images")
        .order("name", { ascending: true });
      if (!productsRes.error) setAllProducts(productsRes.data || []);

      if (!isNew) {
        const { data, error } = await supabase
          .from("drops")
          .select("*, drop_products(product_id, sort_order)")
          .eq("id", id)
          .maybeSingle();
        if (error) {
          showToast(error.message, "error");
        } else if (data) {
          setForm({
            ...EMPTY,
            ...data,
            release_at: data.release_at ? data.release_at.slice(0, 10) : "",
          });
          setSlugTouched(true);
          const links = (data.drop_products || []).sort(
            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
          );
          const byId = new Map((productsRes.data || []).map((p) => [p.id, p]));
          setAssigned(
            links.map((l) => {
              const p = byId.get(l.product_id);
              return {
                product_id: l.product_id,
                name: p?.name || "(deleted product)",
                image: Array.isArray(p?.images) ? p.images[0] : null,
              };
            })
          );
        }
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onNameChange = (v) =>
    setForm((f) => ({ ...f, name: v, slug: slugTouched ? f.slug : slugify(v) }));

  const assignedIds = useMemo(() => new Set(assigned.map((a) => a.product_id)), [assigned]);
  const available = useMemo(
    () => allProducts.filter((p) => !assignedIds.has(p.id)),
    [allProducts, assignedIds]
  );

  const addProduct = (p) =>
    setAssigned((prev) => [
      ...prev,
      { product_id: p.id, name: p.name, image: Array.isArray(p.images) ? p.images[0] : null },
    ]);

  const removeProduct = (pid) =>
    setAssigned((prev) => prev.filter((a) => a.product_id !== pid));

  const onDrop = (i) => {
    if (dragIndex == null || dragIndex === i) return;
    setAssigned((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(i, 0, moved);
      return next;
    });
    setDragIndex(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return showToast("Supabase not configured", "error");
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      slug: (form.slug || slugify(form.name)).trim(),
      description: form.description,
      hero_image: form.hero_image || null,
      status: form.status,
      release_at: form.release_at ? new Date(form.release_at).toISOString() : null,
      sort_order: Number(form.sort_order) || 0,
    };

    try {
      let dropId = id;
      if (isNew) {
        const { data, error } = await supabase.from("drops").insert(payload).select("id").single();
        if (error) throw error;
        dropId = data.id;
      } else {
        const { error } = await supabase.from("drops").update(payload).eq("id", id);
        if (error) throw error;
      }

      // Sync product assignment: replace all links with the current ordered set.
      const { error: delErr } = await supabase.from("drop_products").delete().eq("drop_id", dropId);
      if (delErr) throw delErr;
      if (assigned.length) {
        const links = assigned.map((a, idx) => ({
          drop_id: dropId,
          product_id: a.product_id,
          sort_order: idx,
        }));
        const { error: insErr } = await supabase.from("drop_products").insert(links);
        if (insErr) throw insErr;
      }

      showToast(isNew ? "Drop created" : "Drop saved");
      navigate("/admin/drops", { replace: true });
    } catch (err) {
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: "#6b6b6b" }}>Loading…</div>;

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: "880px" }}>
      <div style={cardStyle}>
        <Section label="Drop details" />
        <Field label="Name">
          <input style={inputStyle} value={form.name} onChange={(e) => onNameChange(e.target.value)} required />
        </Field>
        <Field label="Slug" hint="Auto-generated from name — edit if needed">
          <input
            style={inputStyle}
            value={form.slug}
            onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }}
            required
          />
        </Field>
        <Field label="Description">
          <textarea
            style={{ ...inputStyle, minHeight: "100px", resize: "vertical", fontFamily: "inherit" }}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
          <Field label="Status">
            <select style={inputStyle} value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </Field>
          <Field label="Release date" hint="Optional">
            <input type="date" style={inputStyle} value={form.release_at} onChange={(e) => set("release_at", e.target.value)} />
          </Field>
          <Field label="Sort order" hint="Lower shows first">
            <input type="number" style={inputStyle} value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
          </Field>
        </div>
      </div>

      <div style={cardStyle}>
        <Section label="Hero image" />
        <ImageUploader
          value={form.hero_image ? [form.hero_image] : []}
          onChange={(arr) => set("hero_image", arr[arr.length - 1] || "")}
        />
        <p style={{ fontSize: "0.72rem", color: "#9a9a9a", marginTop: "0.5rem" }}>
          The most recently added image is used as the drop hero.
        </p>
      </div>

      <div style={cardStyle}>
        <Section label={`Products in this drop (${assigned.length})`} />
        {assigned.length === 0 && (
          <p style={{ color: "#9a9a9a", fontSize: "0.85rem", margin: "0 0 0.75rem" }}>
            No products yet. Add from the list below. Drag to reorder.
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
          {assigned.map((a, i) => (
            <div
              key={a.product_id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.4rem 0.5rem",
                border: "0.5px solid #e5e3de",
                background: "#fff",
                cursor: "grab",
              }}
            >
              <span style={{ color: "#c9a96e", fontSize: "0.9rem" }}>⠿</span>
              <span style={{ color: "#9a9a9a", fontSize: "0.75rem", width: "1.5rem" }}>{i + 1}</span>
              <div
                style={{
                  width: 28, height: 28, borderRadius: 3,
                  background: a.image ? `url(${a.image}) center/cover no-repeat` : "#f0eeea",
                  border: "0.5px solid #e5e3de", flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, fontSize: "0.85rem" }}>{a.name}</span>
              <button
                type="button"
                onClick={() => removeProduct(a.product_id)}
                style={{ background: "transparent", border: "none", color: "#c43030", fontSize: "0.78rem", cursor: "pointer" }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <Section label="Add products" />
        <div
          style={{
            maxHeight: "240px",
            overflowY: "auto",
            border: "0.5px solid #e5e3de",
            background: "#fafaf8",
          }}
        >
          {available.length === 0 ? (
            <p style={{ color: "#9a9a9a", fontSize: "0.85rem", padding: "0.75rem" }}>
              All products are assigned.
            </p>
          ) : (
            available.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addProduct(p)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.6rem", width: "100%",
                  padding: "0.4rem 0.6rem", background: "transparent", border: "none",
                  borderBottom: "0.5px solid #f0eeea", cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{ color: "#c9a96e", fontWeight: 600 }}>+</span>
                <div
                  style={{
                    width: 24, height: 24, borderRadius: 3,
                    background: Array.isArray(p.images) && p.images[0] ? `url(${p.images[0]}) center/cover no-repeat` : "#f0eeea",
                    border: "0.5px solid #e5e3de", flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "0.85rem", color: "#1a1a1a" }}>{p.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
        <button type="button" onClick={() => navigate("/admin/drops")} style={ghostBtn}>Cancel</button>
        <button type="submit" disabled={saving} style={primaryBtn}>
          {saving ? "Saving…" : isNew ? "Create drop" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "8px" }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <span style={{ fontSize: "0.72rem", color: "#9a9a9a" }}>{hint}</span>}
    </div>
  );
}

function Section({ label }) {
  return (
    <h2 style={{ margin: "0 0 1rem", fontSize: "0.75rem", letterSpacing: "0.1em", color: "#6b6b6b", textTransform: "uppercase", fontWeight: 600 }}>
      {label}
    </h2>
  );
}

const cardStyle = { background: "#fff", border: "0.5px solid #e5e3de", padding: "1.5rem", marginBottom: "1rem" };
const labelStyle = { fontSize: "0.75rem", color: "#1a1a1a", fontWeight: 500 };
const inputStyle = { background: "#fff", border: "0.5px solid #d6d3cc", color: "#1a1a1a", padding: "0.55rem 0.7rem", fontSize: "0.9rem", width: "100%" };
const primaryBtn = { background: "#c9a96e", color: "#0f0f0f", border: "none", padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer" };
const ghostBtn = { background: "transparent", color: "#1a1a1a", border: "0.5px solid #d6d3cc", padding: "0.55rem 1rem", fontSize: "0.85rem", cursor: "pointer" };
