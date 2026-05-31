import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import StatusBadge from "./components/StatusBadge";
import ConfirmDialog from "./components/ConfirmDialog";
import { useAdminToast } from "./components/Toast";

const FILTERS = [
  { value: "all", label: "Everyone (signups + accounts)" },
  { value: "customers", label: "Registered customers" },
  { value: "partners", label: "Partners only" },
];

const STATUS_TONE = { draft: "inactive", sending: "pending", sent: "active", failed: "cancelled" };

async function authedPost(payload) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  const res = await fetch("/api/admin-broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

export default function AdminBroadcasts() {
  const { showToast } = useAdminToast();
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [recipientFilter, setRecipientFilter] = useState("all");
  const [previewCount, setPreviewCount] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("email_broadcasts")
      .select("id, subject, recipient_filter, status, sent_count, created_at, sent_at")
      .order("created_at", { ascending: false })
      .limit(25);
    setHistory(data || []);
  };

  useEffect(() => { loadHistory(); /* eslint-disable-next-line */ }, []);
  // Reset a stale preview when the filter changes.
  useEffect(() => { setPreviewCount(null); }, [recipientFilter]);

  const doPreview = async () => {
    setPreviewing(true);
    try {
      const { count } = await authedPost({ action: "preview", recipientFilter });
      setPreviewCount(count);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setPreviewing(false);
    }
  };

  const doSend = async () => {
    setConfirming(false);
    setSending(true);
    try {
      const { sentCount } = await authedPost({ action: "send", subject, bodyHtml, recipientFilter });
      showToast(`Sent to ${sentCount} recipient${sentCount === 1 ? "" : "s"}`);
      setSubject("");
      setBodyHtml("");
      setPreviewCount(null);
      loadHistory();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSending(false);
    }
  };

  const canSend = subject.trim() && bodyHtml.trim() && !sending;

  return (
    <div style={{ maxWidth: "820px" }}>
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Compose broadcast</h2>

        <Field label="Subject">
          <input style={inputStyle} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" />
        </Field>

        <Field label="Body (HTML allowed)">
          <textarea
            style={{ ...inputStyle, minHeight: "180px", resize: "vertical", fontFamily: "inherit" }}
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            placeholder="<p>Your message…</p>"
          />
        </Field>

        <Field label="Recipients">
          <select style={inputStyle} value={recipientFilter} onChange={(e) => setRecipientFilter(e.target.value)}>
            {FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </Field>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button type="button" onClick={doPreview} disabled={previewing} style={ghostBtn}>
            {previewing ? "Counting…" : "Preview recipient count"}
          </button>
          {previewCount != null && (
            <span style={{ fontSize: "0.85rem", color: "#1a1a1a" }}>
              <strong>{previewCount}</strong> recipient{previewCount === 1 ? "" : "s"}
            </span>
          )}
          <div style={{ marginLeft: "auto" }}>
            <button
              type="button"
              disabled={!canSend}
              onClick={async () => {
                // Ensure we show a count in the confirm dialog.
                if (previewCount == null) {
                  try {
                    const { count } = await authedPost({ action: "preview", recipientFilter });
                    setPreviewCount(count);
                  } catch { /* fall through; confirm will say "recipients" */ }
                }
                setConfirming(true);
              }}
              style={{ ...primaryBtn, opacity: canSend ? 1 : 0.5, cursor: canSend ? "pointer" : "not-allowed" }}
            >
              {sending ? "Sending…" : "Send broadcast"}
            </button>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: "0.85rem", margin: "1.5rem 0 0.75rem", color: "#1a1a1a", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        History
      </h2>
      <div style={{ background: "#fff", border: "0.5px solid #e5e3de" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Subject", "Recipients", "Status", "Sent", "Date"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr><td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: "#9a9a9a", padding: "2rem" }}>No broadcasts sent yet</td></tr>
            ) : history.map((b) => (
              <tr key={b.id}>
                <td style={tdStyle}>{b.subject}</td>
                <td style={tdStyle}>{b.recipient_filter}</td>
                <td style={tdStyle}><StatusBadge status={STATUS_TONE[b.status] || "inactive"}>{b.status}</StatusBadge></td>
                <td style={tdStyle}>{b.sent_count}</td>
                <td style={tdStyle}>{b.sent_at ? new Date(b.sent_at).toLocaleString() : new Date(b.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Send this broadcast?"
        message={`This will email ${previewCount != null ? previewCount : "all matching"} recipient${previewCount === 1 ? "" : "s"} (${recipientFilter}). This cannot be undone.`}
        confirmLabel="Send now"
        onCancel={() => setConfirming(false)}
        onConfirm={doSend}
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "0.75rem" }}>
      <label style={{ fontSize: "0.75rem", color: "#1a1a1a", fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

const cardStyle = { background: "#fff", border: "0.5px solid #e5e3de", padding: "1.5rem" };
const sectionTitle = { margin: "0 0 1rem", fontSize: "0.95rem", color: "#1a1a1a", letterSpacing: "0.02em" };
const inputStyle = { background: "#fff", border: "0.5px solid #d6d3cc", color: "#1a1a1a", padding: "0.55rem 0.7rem", fontSize: "0.9rem", width: "100%" };
const primaryBtn = { background: "#c9a96e", color: "#0f0f0f", border: "none", padding: "0.55rem 1.25rem", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" };
const ghostBtn = { background: "transparent", color: "#1a1a1a", border: "0.5px solid #d6d3cc", padding: "0.5rem 0.9rem", fontSize: "0.82rem", cursor: "pointer" };
const thStyle = { textAlign: "left", padding: "0.6rem 0.75rem", fontSize: "0.7rem", letterSpacing: "0.05em", color: "#6b6b6b", textTransform: "uppercase", background: "#fafaf8", borderBottom: "0.5px solid #e5e3de", fontWeight: 600 };
const tdStyle = { padding: "0.6rem 0.75rem", fontSize: "0.85rem", color: "#1a1a1a", borderBottom: "0.5px solid #f0eeea" };
