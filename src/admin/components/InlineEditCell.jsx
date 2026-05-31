import { useEffect, useRef, useState } from "react";

/**
 * InlineEditCell — click-to-edit table cell.
 *
 * Click the value to edit, Enter to save, Escape to cancel. While saving, the
 * cell is disabled. onSave receives the parsed value and should return a
 * Promise; if it rejects, the cell reverts to the original value.
 *
 * Props:
 *   value     current value
 *   type      "number" | "text"  (default "text")
 *   prefix    optional string shown before the value (e.g. "$")
 *   format    (value) => string for display rendering
 *   min/step  forwarded to the number input
 *   onSave    async (parsedValue) => void   — throws/rejects on failure
 */
export default function InlineEditCell({
  value,
  type = "text",
  prefix = "",
  format,
  min,
  step,
  onSave,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [editing]);

  const display = format ? format(value) : `${prefix}${value ?? ""}`;

  const commit = async () => {
    const parsed = type === "number" ? Number(draft) : String(draft);
    // No change → just close.
    if (parsed === value || (type === "number" && Number(value) === parsed)) {
      setEditing(false);
      return;
    }
    if (type === "number" && Number.isNaN(parsed)) {
      setDraft(value);
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(parsed);
      setEditing(false);
    } catch {
      // Revert on failure; the caller surfaces the error toast.
      setDraft(value);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        title="Click to edit"
        style={{
          background: "transparent",
          border: "0.5px solid transparent",
          borderRadius: 3,
          padding: "0.2rem 0.4rem",
          fontSize: "0.85rem",
          color: "#1a1a1a",
          cursor: "text",
          textAlign: "left",
          width: "100%",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#d6d3cc")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
      >
        {display}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      type={type}
      min={min}
      step={step}
      disabled={saving}
      value={draft ?? ""}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") commit();
        else if (e.key === "Escape") cancel();
      }}
      onBlur={commit}
      style={{
        width: "100%",
        maxWidth: "110px",
        padding: "0.2rem 0.4rem",
        fontSize: "0.85rem",
        border: "0.5px solid #c9a96e",
        borderRadius: 3,
        background: "#fff",
        color: "#1a1a1a",
        outline: "none",
      }}
    />
  );
}
