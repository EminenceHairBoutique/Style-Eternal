import { createContext, useCallback, useContext, useState } from "react";

const AdminToastCtx = createContext({ showToast: () => {} });

export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <AdminToastCtx.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          zIndex: 9999,
        }}
      >
        {toasts.map((t) => {
          const color = t.type === "error" ? "#c43030" : t.type === "info" ? "#2c6cb0" : "#1d6a3a";
          return (
            <div
              key={t.id}
              role="status"
              style={{
                background: "#0f0f0f",
                color: "#f0f0f0",
                padding: "0.65rem 1rem",
                borderLeft: `2px solid ${color}`,
                fontSize: "0.85rem",
                minWidth: "220px",
                animation: "admin-toast-in 180ms ease-out",
              }}
            >
              {t.message}
            </div>
          );
        })}
      </div>
    </AdminToastCtx.Provider>
  );
}

export function useAdminToast() {
  return useContext(AdminToastCtx);
}
