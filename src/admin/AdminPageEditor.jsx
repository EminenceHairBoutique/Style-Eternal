import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import BlockRenderer from "../components/BlockRenderer";
import ConfirmDialog from "./components/ConfirmDialog";
import { useAdminToast } from "./components/Toast";
import { invalidateContent } from "../lib/contentCache";

const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `b_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

const BLOCK_TYPES = [
  { type: "heading", label: "Heading" },
  { type: "paragraph", label: "Paragraph" },
  { type: "image", label: "Image" },
  { type: "list", label: "List" },
  { type: "divider", label: "Divider" },
  { type: "accordion", label: "Accordion (FAQ)" },
];

const defaultData = (type) => {
  switch (type) {
    case "heading": return { text: "New heading", level: 2 };
    case "paragraph": return { text: "" };
    case "image": return { url: "", alt: "", caption: "" };
    case "list": return { style: "bullet", items: [""] };
    case "divider": return {};
    case "accordion": return { items: [{ q: "", a: "" }] };
    default: return {};
  }
};

export default function AdminPageEditor() {
  const { key } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAdminToast();

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("page_key, title, blocks")
        .eq("page_key", key)
        .maybeSingle();
      if (error) showToast(error.message, "error");
      else if (data) {
        setTitle(data.title || "");
        setBlocks(Array.isArray(data.blocks) ? data.blocks : []);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [key]);

  const addBlock = (type) =>
    setBlocks((prev) => [...prev, { id: uid(), type, data: defaultData(type) }]);

  const updateData = (id, patch) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, data: { ...b.data, ...patch } } : b)));

  const deleteBlock = (id) =>
    setBlocks((prev) => prev.filter((b) => b.id !== id));

  const move = (index, dir) =>
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const onDrop = (i) => {
    if (dragIndex == null || dragIndex === i) return;
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(i, 0, moved);
      return next;
    });
    setDragIndex(null);
  };

  const save = async () => {
    if (!supabase) return showToast("Supabase not configured", "error");
    setSaving(true);
    const { error } = await supabase
      .from("page_content")
      .update({ title, blocks })
      .eq("page_key", key);
    setSaving(false);
    if (error) return showToast(error.message, "error");
    invalidateContent(key);
    showToast("Page saved");
  };

  if (loading) return <div style={{ color: "#6b6b6b" }}>Loading…</div>;

  return (
    <div style={{ maxWidth: "820px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Page title"
          style={{ ...inputStyle, fontSize: "1rem", maxWidth: "360px" }}
        />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" onClick={() => setPreview((p) => !p)} style={ghostBtn}>
            {preview ? "Edit" : "Preview"}
          </button>
          <button type="button" onClick={() => navigate("/admin/pages")} style={ghostBtn}>Back</button>
          <button type="button" onClick={save} disabled={saving} style={primaryBtn}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {preview ? (
        <div style={{ background: "#0f0f0f", padding: "2rem", borderRadius: 4 }}>
          <div className="text-se-bone">
            {blocks.length === 0 ? (
              <p style={{ color: "#6b6b6b" }}>No blocks to preview.</p>
            ) : (
              <BlockRenderer blocks={blocks} />
            )}
          </div>
        </div>
      ) : (
        <>
          {blocks.length === 0 && (
            <div style={{ ...cardStyle, textAlign: "center", color: "#9a9a9a" }}>
              No blocks yet. Add one below.
            </div>
          )}

          {blocks.map((block, i) => (
            <div
              key={block.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              style={cardStyle}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span title="Drag to reorder" style={{ cursor: "grab", color: "#c9a96e" }}>⠿</span>
                  <span style={{ fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6b6b", fontWeight: 600 }}>
                    {block.type}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button type="button" onClick={() => move(i, -1)} style={iconBtn} title="Move up">↑</button>
                  <button type="button" onClick={() => move(i, 1)} style={iconBtn} title="Move down">↓</button>
                  <button type="button" onClick={() => setConfirmDelete(block.id)} style={{ ...iconBtn, color: "#c43030", borderColor: "#e9c4c4" }} title="Delete">✕</button>
                </div>
              </div>
              <BlockEditor block={block} onChange={(patch) => updateData(block.id, patch)} />
            </div>
          ))}

          <div style={{ ...cardStyle, display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "#6b6b6b", marginRight: "0.25rem" }}>Add block:</span>
            {BLOCK_TYPES.map((b) => (
              <button key={b.type} type="button" onClick={() => addBlock(b.type)} style={addBtn}>
                + {b.label}
              </button>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete block?"
        message="This block will be removed. You still need to Save to persist the change."
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => { deleteBlock(confirmDelete); setConfirmDelete(null); }}
      />
    </div>
  );
}

function BlockEditor({ block, onChange }) {
  const { type, data } = block;

  if (type === "heading") {
    return (
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input style={{ ...inputStyle, flex: 1 }} value={data.text || ""} onChange={(e) => onChange({ text: e.target.value })} placeholder="Heading text" />
        <select style={{ ...inputStyle, width: "120px" }} value={data.level || 2} onChange={(e) => onChange({ level: Number(e.target.value) })}>
          {[1, 2, 3, 4].map((l) => <option key={l} value={l}>H{l}</option>)}
        </select>
      </div>
    );
  }
  if (type === "paragraph") {
    return (
      <textarea
        style={{ ...inputStyle, minHeight: "90px", resize: "vertical", fontFamily: "inherit" }}
        value={data.text || ""}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="Paragraph text — supports **bold** and [links](https://…)"
      />
    );
  }
  if (type === "image") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <input style={inputStyle} value={data.url || ""} onChange={(e) => onChange({ url: e.target.value })} placeholder="Image URL" />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input style={{ ...inputStyle, flex: 1 }} value={data.alt || ""} onChange={(e) => onChange({ alt: e.target.value })} placeholder="Alt text" />
          <input style={{ ...inputStyle, flex: 1 }} value={data.caption || ""} onChange={(e) => onChange({ caption: e.target.value })} placeholder="Caption (optional)" />
        </div>
        {data.url && <img src={data.url} alt={data.alt || ""} style={{ maxHeight: 120, objectFit: "cover", border: "0.5px solid #e5e3de" }} />}
      </div>
    );
  }
  if (type === "list") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <select style={{ ...inputStyle, width: "140px" }} value={data.style || "bullet"} onChange={(e) => onChange({ style: e.target.value })}>
          <option value="bullet">Bullet</option>
          <option value="number">Numbered</option>
        </select>
        <textarea
          style={{ ...inputStyle, minHeight: "90px", resize: "vertical", fontFamily: "inherit" }}
          value={(data.items || []).join("\n")}
          onChange={(e) => onChange({ items: e.target.value.split("\n") })}
          placeholder="One item per line"
        />
      </div>
    );
  }
  if (type === "divider") {
    return <div style={{ color: "#9a9a9a", fontSize: "0.8rem" }}>A horizontal rule. No options.</div>;
  }
  if (type === "accordion") {
    const items = data.items || [];
    const setItem = (idx, patch) => onChange({ items: items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) });
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {items.map((it, idx) => (
          <div key={idx} style={{ border: "0.5px solid #e5e3de", padding: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <input style={inputStyle} value={it.q || ""} onChange={(e) => setItem(idx, { q: e.target.value })} placeholder="Question" />
            <textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical", fontFamily: "inherit" }} value={it.a || ""} onChange={(e) => setItem(idx, { a: e.target.value })} placeholder="Answer" />
            <button type="button" onClick={() => onChange({ items: items.filter((_, i) => i !== idx) })} style={{ alignSelf: "flex-end", background: "transparent", border: "none", color: "#c43030", fontSize: "0.75rem", cursor: "pointer" }}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange({ items: [...items, { q: "", a: "" }] })} style={addBtn}>+ Add Q&amp;A</button>
      </div>
    );
  }
  return null;
}

const cardStyle = { background: "#fff", border: "0.5px solid #e5e3de", padding: "1rem 1.25rem", marginBottom: "0.75rem" };
const inputStyle = { background: "#fff", border: "0.5px solid #d6d3cc", color: "#1a1a1a", padding: "0.5rem 0.65rem", fontSize: "0.9rem", width: "100%" };
const primaryBtn = { background: "#c9a96e", color: "#0f0f0f", border: "none", padding: "0.5rem 1.1rem", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer" };
const ghostBtn = { background: "transparent", color: "#1a1a1a", border: "0.5px solid #d6d3cc", padding: "0.5rem 0.9rem", fontSize: "0.85rem", cursor: "pointer" };
const addBtn = { background: "#fafaf8", color: "#1a1a1a", border: "0.5px solid #d6d3cc", padding: "0.35rem 0.7rem", fontSize: "0.78rem", cursor: "pointer" };
const iconBtn = { background: "transparent", border: "0.5px solid #d6d3cc", color: "#1a1a1a", width: "26px", height: "26px", fontSize: "0.8rem", cursor: "pointer", lineHeight: 1 };
