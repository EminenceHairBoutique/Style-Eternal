import { useEffect } from "react";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 15, 15, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9000,
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div
        style={{
          background: "#ffffff",
          border: "0.5px solid #d6d3cc",
          borderRadius: "4px",
          padding: "1.5rem",
          maxWidth: "420px",
          width: "100%",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#1a1a1a" }}>{title}</h3>
        {message && (
          <p style={{ margin: "0.75rem 0 1.5rem", color: "#6b6b6b", fontSize: "0.9rem", lineHeight: 1.5 }}>
            {message}
          </p>
        )}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "transparent",
              border: "0.5px solid #d6d3cc",
              color: "#1a1a1a",
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={destructive ? "admin-btn-destructive" : "admin-btn-primary"}
            style={
              destructive
                ? {
                    background: "transparent",
                    border: "0.5px solid #c43030",
                    color: "#c43030",
                    padding: "0.5rem 1rem",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }
                : {
                    background: "#c9a96e",
                    border: "0.5px solid #c9a96e",
                    color: "#0f0f0f",
                    padding: "0.5rem 1rem",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
