import { useMemo, useState } from "react";

const td = {
  padding: "0.65rem 0.75rem",
  fontSize: "0.85rem",
  color: "#1a1a1a",
  borderBottom: "0.5px solid #e5e3de",
  verticalAlign: "middle",
};

const th = {
  ...td,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontSize: "0.7rem",
  color: "#6b6b6b",
  fontWeight: 600,
  background: "#fafaf8",
  textAlign: "left",
  cursor: "pointer",
  userSelect: "none",
};

/**
 * Generic sortable + searchable table.
 *
 * columns: [{ key, label, sortable?, render?(row), width?, accessor?(row) }]
 * rows:    array of plain objects
 * search:  { value, onChange, placeholder } — controlled by parent
 * filters: [{ value, onChange, options: [{label, value}] }]
 * onRowClick: optional row click handler
 * loading: shows skeleton rows
 * emptyState: { icon?, title, subtext }
 */
export default function AdminTable({
  columns,
  rows,
  search,
  filters = [],
  actions,
  onRowClick,
  loading = false,
  emptyState,
  defaultSort,
}) {
  const [sort, setSort] = useState(defaultSort || { key: null, dir: "asc" });

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const get = col?.accessor || ((r) => r[sort.key]);
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") {
        return sort.dir === "asc" ? va - vb : vb - va;
      }
      return sort.dir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return copy;
  }, [rows, sort, columns]);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  return (
    <div>
      {(search || filters.length > 0 || actions) && (
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          {search && (
            <input
              type="search"
              placeholder={search.placeholder || "Search…"}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                border: "0.5px solid #d6d3cc",
                background: "#fff",
                fontSize: "0.85rem",
                minWidth: "240px",
                color: "#1a1a1a",
              }}
            />
          )}
          {filters.map((f, i) => (
            <select
              key={i}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                border: "0.5px solid #d6d3cc",
                background: "#fff",
                fontSize: "0.85rem",
                color: "#1a1a1a",
              }}
            >
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
          <div style={{ marginLeft: "auto" }}>{actions}</div>
        </div>
      )}

      <div
        style={{
          background: "#fff",
          border: "0.5px solid #e5e3de",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ ...th, cursor: c.sortable ? "pointer" : "default", width: c.width }}
                  onClick={() => c.sortable && toggleSort(c.key)}
                >
                  {c.label}
                  {c.sortable && sort.key === c.key && (
                    <span style={{ marginLeft: 4, color: "#c9a96e" }}>
                      {sort.dir === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    {columns.map((c) => (
                      <td key={c.key} style={td}>
                        <span className="admin-skeleton" />
                      </td>
                    ))}
                  </tr>
                ))
              : sorted.length === 0
                ? (
                    <tr>
                      <td colSpan={columns.length} style={{ ...td, textAlign: "center", padding: "3rem 1rem" }}>
                        <EmptyState {...(emptyState || {})} />
                      </td>
                    </tr>
                  )
                : sorted.map((row, i) => (
                    <tr
                      key={row.id || i}
                      onClick={() => onRowClick?.(row)}
                      style={{
                        cursor: onRowClick ? "pointer" : "default",
                        background: i % 2 === 1 ? "#fcfbf9" : "#fff",
                      }}
                    >
                      {columns.map((c) => (
                        <td key={c.key} style={td}>
                          {c.render ? c.render(row) : row[c.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState({ icon = "∅", title = "No results", subtext }) {
  return (
    <div style={{ color: "#9a9a9a" }}>
      <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem", color: "#c9a96e" }}>{icon}</div>
      <div style={{ fontSize: "1rem", color: "#1a1a1a", marginBottom: "0.25rem" }}>{title}</div>
      {subtext && <div style={{ fontSize: "0.85rem" }}>{subtext}</div>}
    </div>
  );
}
