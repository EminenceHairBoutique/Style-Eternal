const TONES = {
  fulfilled:  { bg: "#e7f4ec", text: "#1d6a3a", border: "#bfe1c9" },
  processing: { bg: "#e3eefa", text: "#1f4f86", border: "#bfd6f0" },
  pending:    { bg: "#fbf1d9", text: "#8a6310", border: "#ecdca0" },
  cancelled:  { bg: "#fbe5e5", text: "#982020", border: "#f0bcbc" },
  active:     { bg: "#e7f4ec", text: "#1d6a3a", border: "#bfe1c9" },
  inactive:   { bg: "#eeeeee", text: "#555555", border: "#dcdcdc" },
  expired:    { bg: "#fbe5e5", text: "#982020", border: "#f0bcbc" },
};

export default function StatusBadge({ status, children }) {
  const key = String(status || "").toLowerCase();
  const tone = TONES[key] || { bg: "#eeeeee", text: "#555555", border: "#dcdcdc" };
  const label = children || (key ? key[0].toUpperCase() + key.slice(1) : "—");
  return (
    <span
      style={{
        background: tone.bg,
        color: tone.text,
        border: `0.5px solid ${tone.border}`,
        borderRadius: "999px",
        padding: "2px 10px",
        fontSize: "0.72rem",
        fontWeight: 500,
        letterSpacing: "0.02em",
        display: "inline-block",
        lineHeight: 1.4,
      }}
    >
      {label}
    </span>
  );
}
