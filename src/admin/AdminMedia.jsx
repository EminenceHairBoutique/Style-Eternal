import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ConfirmDialog from "./components/ConfirmDialog";
import { uploadMediaFile } from "./components/mediaUpload";
import { useAdminToast } from "./components/Toast";

export default function AdminMedia() {
  const { showToast } = useAdminToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const fileRef = useRef(null);

  const load = async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("media_library")
      .select("id, url, filename, size_bytes, uploaded_at")
      .order("uploaded_at", { ascending: false });
    if (error) showToast(error.message, "error");
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load();   }, []);

  const handleFiles = async (files) => {
    setUploading(true);
    try {
      for (const f of files) {
        const row = await uploadMediaFile(f);
        setItems((prev) => [row, ...prev]);
      }
      showToast(`Uploaded ${files.length} image${files.length > 1 ? "s" : ""}`);
    } catch (e) {
      showToast(e.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("URL copied");
    } catch {
      showToast("Could not copy", "error");
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.from("media_library").delete().eq("id", confirmDelete.id);
    setConfirmDelete(null);
    if (error) return showToast(error.message, "error");
    setItems((prev) => prev.filter((m) => m.id !== confirmDelete.id));
    showToast("Removed from library");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={primaryBtn}>
          {uploading ? "Uploading…" : "+ Upload images"}
        </button>
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

      {loading ? (
        <p style={{ color: "#9a9a9a" }}>Loading…</p>
      ) : items.length === 0 ? (
        <div style={{ background: "#fff", border: "0.5px solid #e5e3de", padding: "3rem", textAlign: "center", color: "#9a9a9a" }}>
          <div style={{ fontSize: "1.75rem", color: "#c9a96e", marginBottom: "0.5rem" }}>⛶</div>
          <div style={{ color: "#1a1a1a", marginBottom: "0.25rem" }}>No media yet</div>
          <div style={{ fontSize: "0.85rem" }}>Upload images to reuse across drops, pages, and the homepage.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem" }}>
          {items.map((m) => (
            <div key={m.id} style={{ border: "0.5px solid #e5e3de", background: "#fff" }}>
              <div style={{ aspectRatio: "1 / 1", background: `url(${m.url}) center/cover no-repeat #f5f2ec` }} />
              <div style={{ padding: "0.4rem 0.5rem" }}>
                <div style={{ fontSize: "0.72rem", color: "#6b6b6b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={m.filename}>
                  {m.filename || "image"}
                </div>
                <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.35rem" }}>
                  <button type="button" onClick={() => copyUrl(m.url)} style={miniBtn}>Copy URL</button>
                  <button type="button" onClick={() => setConfirmDelete(m)} style={{ ...miniBtn, color: "#c43030", borderColor: "#e9c4c4" }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete media?"
        message={confirmDelete ? `Remove "${confirmDelete.filename || "this image"}" from the library? The file stays in storage but won't appear in the picker.` : ""}
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDelete(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}

const primaryBtn = { background: "#c9a96e", color: "#0f0f0f", border: "none", padding: "0.55rem 1rem", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer" };
const miniBtn = { flex: 1, background: "transparent", border: "0.5px solid #d6d3cc", color: "#1a1a1a", padding: "0.25rem 0.3rem", fontSize: "0.68rem", cursor: "pointer" };
