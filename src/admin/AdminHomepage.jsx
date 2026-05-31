import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import MediaPicker from "./components/MediaPicker";
import ConfirmDialog from "./components/ConfirmDialog";
import { useAdminToast } from "./components/Toast";
import { invalidateContent } from "../lib/contentCache";

const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

const emptySlide = () => ({
  id: uid(),
  type: "hero",
  data: { image: "", headline: "", subtext: "", ctaLabel: "", ctaHref: "" },
});

export default function AdminHomepage() {
  const { showToast } = useAdminToast();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerFor, setPickerFor] = useState(null); // slide id currently picking an image
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("blocks")
        .eq("page_key", "homepage")
        .maybeSingle();
      if (error) showToast(error.message, "error");
      else {
        const heroes = (data?.blocks || []).filter((b) => b.type === "hero");
        setSlides(heroes.length ? heroes : [emptySlide()]);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, []);

  const update = (id, patch) =>
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, data: { ...s.data, ...patch } } : s)));

  const move = (index, dir) =>
    setSlides((prev) => {
      const next = [...prev];
      const t = index + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[index], next[t]] = [next[t], next[index]];
      return next;
    });

  const onDrop = (i) => {
    if (dragIndex == null || dragIndex === i) return;
    setSlides((prev) => {
      const next = [...prev];
      const [m] = next.splice(dragIndex, 1);
      next.splice(i, 0, m);
      return next;
    });
    setDragIndex(null);
  };

  const save = async () => {
    if (!supabase) return showToast("Supabase not configured", "error");
    setSaving(true);
    const { error } = await supabase
      .from("page_content")
      .update({ blocks: slides })
      .eq("page_key", "homepage");
    setSaving(false);
    if (error) return showToast(error.message, "error");
    invalidateContent("homepage");
    showToast("Homepage saved");
  };

  if (loading) return <div style={{ color: "#6b6b6b" }}>Loading…</div>;

  return (
    <div style={{ maxWidth: "760px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b6b6b" }}>
          {slides.length} hero slide{slides.length !== 1 ? "s" : ""}
        </p>
        <button type="button" onClick={save} disabled={saving} style={primaryBtn}>
          {saving ? "Saving…" : "Save homepage"}
        </button>
      </div>

      {slides.map((s, i) => (
        <div
          key={s.id}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(i)}
          style={cardStyle}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ cursor: "grab", color: "#c9a96e" }}>⠿</span>
              <span style={{ fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6b6b", fontWeight: 600 }}>
                Slide {i + 1}
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              <button type="button" onClick={() => move(i, -1)} style={iconBtn} title="Move up">↑</button>
              <button type="button" onClick={() => move(i, 1)} style={iconBtn} title="Move down">↓</button>
              <button type="button" onClick={() => setConfirmDelete(s.id)} style={{ ...iconBtn, color: "#c43030", borderColor: "#e9c4c4" }} title="Delete">✕</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "1rem" }}>
            <div>
              <div
                style={{
                  aspectRatio: "4 / 5",
                  background: s.data.image ? `url(${s.data.image}) center/cover no-repeat` : "#f0eeea",
                  border: "0.5px solid #e5e3de",
                  marginBottom: "0.5rem",
                }}
              />
              <button type="button" onClick={() => setPickerFor(s.id)} style={ghostBtnFull}>
                {s.data.image ? "Change image" : "Pick image"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <input style={inputStyle} value={s.data.headline} onChange={(e) => update(s.id, { headline: e.target.value })} placeholder="Headline" />
              <input style={inputStyle} value={s.data.subtext} onChange={(e) => update(s.id, { subtext: e.target.value })} placeholder="Subtext" />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input style={{ ...inputStyle, flex: 1 }} value={s.data.ctaLabel} onChange={(e) => update(s.id, { ctaLabel: e.target.value })} placeholder="CTA label" />
                <input style={{ ...inputStyle, flex: 1 }} value={s.data.ctaHref} onChange={(e) => update(s.id, { ctaHref: e.target.value })} placeholder="CTA link (e.g. /shop)" />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={() => setSlides((p) => [...p, emptySlide()])} style={addBtn}>
        + Add hero slide
      </button>

      <MediaPicker
        open={!!pickerFor}
        onSelect={(url) => { update(pickerFor, { image: url }); setPickerFor(null); }}
        onClose={() => setPickerFor(null)}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete slide?"
        message="This hero slide will be removed. Save to persist."
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => { setSlides((p) => p.filter((s) => s.id !== confirmDelete)); setConfirmDelete(null); }}
      />
    </div>
  );
}

const cardStyle = { background: "#fff", border: "0.5px solid #e5e3de", padding: "1.25rem", marginBottom: "0.75rem" };
const inputStyle = { background: "#fff", border: "0.5px solid #d6d3cc", color: "#1a1a1a", padding: "0.5rem 0.65rem", fontSize: "0.9rem", width: "100%" };
const primaryBtn = { background: "#c9a96e", color: "#0f0f0f", border: "none", padding: "0.5rem 1.1rem", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer" };
const ghostBtnFull = { width: "100%", background: "transparent", color: "#1a1a1a", border: "0.5px solid #d6d3cc", padding: "0.4rem", fontSize: "0.78rem", cursor: "pointer" };
const addBtn = { background: "#fafaf8", color: "#1a1a1a", border: "0.5px solid #d6d3cc", padding: "0.5rem 1rem", fontSize: "0.82rem", cursor: "pointer" };
const iconBtn = { background: "transparent", border: "0.5px solid #d6d3cc", color: "#1a1a1a", width: "26px", height: "26px", fontSize: "0.8rem", cursor: "pointer", lineHeight: 1 };
