import { useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "product-images";

/**
 * Drag-to-reorder image grid backed by Supabase Storage.
 * - value: string[] of public URLs (first = primary)
 * - onChange: receives new URL[] array
 */
export default function ImageUploader({ value = [], onChange, disabled = false }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  const handleFiles = async (files) => {
    if (!supabase) {
      setError("Supabase not configured");
      return;
    }
    setError("");
    setUploading(true);
    const next = [...value];
    try {
      for (const file of files) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        if (data?.publicUrl) next.push(data.publicUrl);
      }
      onChange(next);
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const onDragStart = (i) => setDragIndex(i);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (i) => {
    if (dragIndex == null || dragIndex === i) return;
    const next = [...value];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(i, 0, moved);
    onChange(next);
    setDragIndex(null);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.75rem" }}>
        {value.map((url, i) => (
          <div
            key={url + i}
            draggable={!disabled}
            onDragStart={() => onDragStart(i)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(i)}
            style={{
              position: "relative",
              aspectRatio: "1 / 1",
              border: i === 0 ? "0.5px solid #c9a96e" : "0.5px solid #d6d3cc",
              background: `url(${url}) center/cover no-repeat #f5f2ec`,
              cursor: disabled ? "default" : "grab",
            }}
            title={i === 0 ? "Primary image" : "Drag to reorder"}
          >
            {i === 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  background: "#c9a96e",
                  color: "#0f0f0f",
                  fontSize: "0.65rem",
                  padding: "2px 6px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                PRIMARY
              </span>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeAt(i)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "rgba(15,15,15,0.75)",
                  color: "#fff",
                  border: "none",
                  width: "22px",
                  height: "22px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
                aria-label="Remove image"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {!disabled && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              aspectRatio: "1 / 1",
              border: "0.5px dashed #d6d3cc",
              background: "#fafaf8",
              color: "#6b6b6b",
              cursor: uploading ? "wait" : "pointer",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <span style={{ fontSize: "1.4rem", color: "#c9a96e" }}>+</span>
            {uploading ? "Uploading…" : "Add images"}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) handleFiles(files);
          e.target.value = "";
        }}
      />

      {error && <p style={{ color: "#c43030", fontSize: "0.8rem", marginTop: "0.5rem" }}>{error}</p>}
      {value.length > 0 && (
        <p style={{ color: "#9a9a9a", fontSize: "0.75rem", marginTop: "0.5rem" }}>
          First image is the primary thumbnail. Drag to reorder.
        </p>
      )}
    </div>
  );
}
