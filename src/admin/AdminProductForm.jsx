import { useEffect, useState } from "react";
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

const EMPTY = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compare_at_price: "",
  stock: 0,
  category: "",
  variants: [],
  images: [],
  is_active: true,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const { showToast } = useAdminToast();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (isNew || !supabase) return;
    (async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) {
        showToast(error.message, "error");
      } else if (data) {
        setForm({
          ...EMPTY,
          ...data,
          variants: Array.isArray(data.variants) ? data.variants : [],
          images: Array.isArray(data.images) ? data.images : [],
          compare_at_price: data.compare_at_price ?? "",
        });
        setSlugTouched(true);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [id]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const onNameChange = (v) => {
    setForm((f) => ({
      ...f,
      name: v,
      slug: slugTouched ? f.slug : slugify(v),
    }));
  };

  const addVariant = () => set("variants", [...(form.variants || []), { label: "", stock: 0 }]);
  const updateVariant = (i, key, val) =>
    set(
      "variants",
      form.variants.map((v, idx) => (idx === i ? { ...v, [key]: val } : v))
    );
  const removeVariant = (i) => set("variants", form.variants.filter((_, idx) => idx !== i));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return showToast("Supabase not configured", "error");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: (form.slug || slugify(form.name)).trim(),
      description: form.description,
      price: Number(form.price) || 0,
      compare_at_price: form.compare_at_price === "" ? null : Number(form.compare_at_price),
      stock: Number(form.stock) || 0,
      category: form.category || null,
      variants: form.variants,
      images: form.images,
      is_active: !!form.is_active,
    };

    const query = isNew
      ? supabase.from("products").insert(payload).select().single()
      : supabase.from("products").update(payload).eq("id", id).select().single();

    const { data, error } = await query;
    setSaving(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast(isNew ? "Product created" : "Product saved");
    if (isNew && data?.id) navigate(`/admin/products/${data.id}`, { replace: true });
  };

  if (loading) {
    return <div style={{ color: "#6b6b6b" }}>Loading…</div>;
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: "880px" }}>
      <div style={cardStyle}>
        <Section label="Product details" />
        <Field label="Name">
          <input style={inputStyle} value={form.name} onChange={(e) => onNameChange(e.target.value)} required />
        </Field>
        <Field label="Slug" hint="Auto-generated from name — edit if needed">
          <input
            style={inputStyle}
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", slugify(e.target.value));
            }}
            required
          />
        </Field>
        <Field label="Description">
          <textarea
            style={{ ...inputStyle, minHeight: "120px", resize: "vertical", fontFamily: "inherit" }}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <Field label="Category">
          <input style={inputStyle} value={form.category || ""} onChange={(e) => set("category", e.target.value)} />
        </Field>
      </div>

      <div style={cardStyle}>
        <Section label="Pricing & stock" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
          <Field label="Price (USD)">
            <input
              style={inputStyle}
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              required
            />
          </Field>
          <Field label="Compare-at price" hint="Optional — shown as strikethrough">
            <input
              style={inputStyle}
              type="number"
              step="0.01"
              value={form.compare_at_price}
              onChange={(e) => set("compare_at_price", e.target.value)}
            />
          </Field>
          <Field label="Stock">
            <input
              style={inputStyle}
              type="number"
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div style={cardStyle}>
        <Section label="Variants" />
        {form.variants.length === 0 && (
          <p style={{ color: "#9a9a9a", fontSize: "0.85rem", margin: "0 0 0.75rem" }}>
            No variants. Add sizes, colors, or any per-option stock.
          </p>
        )}
        {form.variants.map((v, i) => (
          <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
            <input
              style={{ ...inputStyle, flex: 2 }}
              placeholder="Label (e.g. Medium / Black)"
              value={v.label || ""}
              onChange={(e) => updateVariant(i, "label", e.target.value)}
            />
            <input
              style={{ ...inputStyle, flex: 1 }}
              type="number"
              placeholder="Stock"
              value={v.stock ?? 0}
              onChange={(e) => updateVariant(i, "stock", Number(e.target.value) || 0)}
            />
            <button
              type="button"
              onClick={() => removeVariant(i)}
              style={destructiveLinkStyle}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addVariant} style={ghostBtn}>+ Add variant</button>
      </div>

      <div style={cardStyle}>
        <Section label="Images" />
        <ImageUploader value={form.images} onChange={(imgs) => set("images", imgs)} />
      </div>

      <div style={cardStyle}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "#1a1a1a", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={!!form.is_active}
            onChange={(e) => set("is_active", e.target.checked)}
          />
          Active (visible on storefront)
        </label>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
        <button type="button" onClick={() => navigate("/admin/products")} style={ghostBtn}>
          Cancel
        </button>
        <button type="submit" disabled={saving} style={primaryBtn}>
          {saving ? "Saving…" : isNew ? "Create product" : "Save changes"}
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
    <h2
      style={{
        margin: "0 0 1rem",
        fontSize: "0.75rem",
        letterSpacing: "0.1em",
        color: "#6b6b6b",
        textTransform: "uppercase",
        fontWeight: 600,
      }}
    >
      {label}
    </h2>
  );
}

const cardStyle = {
  background: "#fff",
  border: "0.5px solid #e5e3de",
  padding: "1.5rem",
  marginBottom: "1rem",
};

const labelStyle = {
  fontSize: "0.75rem",
  color: "#1a1a1a",
  fontWeight: 500,
};

const inputStyle = {
  background: "#fff",
  border: "0.5px solid #d6d3cc",
  color: "#1a1a1a",
  padding: "0.55rem 0.7rem",
  fontSize: "0.9rem",
  width: "100%",
};

const primaryBtn = {
  background: "#c9a96e",
  color: "#0f0f0f",
  border: "none",
  padding: "0.6rem 1.25rem",
  fontSize: "0.85rem",
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const ghostBtn = {
  background: "transparent",
  color: "#1a1a1a",
  border: "0.5px solid #d6d3cc",
  padding: "0.55rem 1rem",
  fontSize: "0.85rem",
  cursor: "pointer",
};

const destructiveLinkStyle = {
  background: "transparent",
  border: "none",
  color: "#c43030",
  fontSize: "0.8rem",
  cursor: "pointer",
  padding: "0.3rem 0.5rem",
};
