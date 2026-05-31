import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { uploadMediaFile } from "./mediaUpload";
import { useAdminToast } from "./Toast";

/**
 * MediaPicker — modal to pick an image URL from the media library or upload a
 * new one. Used by the drops hero, page images, and homepage banner editors.
 *
 * Props:
 *   open      boolean
 *   onSelect  (url) => void   called with the chosen image URL
 *   onClose   () => void
 */
export default function MediaPicker({ open, onSelect, onClose }) {
  const { showToast } = useAdminToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open || !supabase) return;
    setLoading(true);
    supabase
      .from("media_library")
      .select("id, url, filename")
      .order("uploaded_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) showToast(error.message, "error");
        else setItems(data || []);
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [open]);

  const handleFiles = async (files) => {
    setUploading(true);
    try {
      let firstUrl = null;
      for (const f of files) {
        const row = await uploadMediaFile(f);
        if (!firstUrl) firstUrl = row.url;
        setItems((prev) => [row, ...prev]);
      }
      showToast("Uploaded");
      if (firstUrl) onSelect(firstUrl);
    } catch (e) {
      showToast(e.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,15,15,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000, padding: "1rem",
      }}
    >
      <div style={{ background: "#fff", border: "0.5px solid #d6d3cc", width: "100%", maxWidth: "640px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "0.5px solid #e5e3de" }}>
          <h3 style={{ margin: 0, fontSize: "1rem", color: "#1a1a1a" }}>Media library</h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={primaryBtn}>
              {uploading ? "Uploading…" : "Upload new"}
            </button>
            <button type="button" onClick={onClose} style={ghostBtn}>Close</button>
          </div>
        </div>
        <div style={{ padding: "1rem 1.25rem", overflowY: "auto" }}>
          {loading ? (
            <p style={{ color: "#9a9a9a", fontSize: "0.85rem" }}>Loading…</p>
          ) : items.length === 0 ? (
            <p style={{ color: "#9a9a9a", fontSize: "0.85rem" }}>No media yet. Upload your first image.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.6rem" }}>
              {items.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelect(m.url)}
                  title={m.filename || m.url}
                  style={{
                    aspectRatio: "1 / 1", border: "0.5px solid #d6d3cc",
                    background: `url(${m.url}) center/cover no-repeat #f5f2ec`, cursor: "pointer", padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <input
          ref={fileRef}
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
      </div>
    </div>
  );
}

const primaryBtn = { background: "#c9a96e", color: "#0f0f0f", border: "none", padding: "0.45rem 0.9rem", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" };
const ghostBtn = { background: "transparent", color: "#1a1a1a", border: "0.5px solid #d6d3cc", padding: "0.45rem 0.9rem", fontSize: "0.8rem", cursor: "pointer" };
