/**
 * AdminRoute — auth guard for all /admin/* routes
 *
 * Strategy:
 * 1. Wait for UserContext to finish loading (loading = true → show spinner)
 * 2. If no user after loading, redirect to /admin/login
 * 3. If user exists, check user.isAdmin (already fetched by UserContext)
 * 4. If not admin, redirect to /admin/login
 * 5. If admin, render children
 *
 * No secondary Supabase query needed — UserContext already fetches is_admin.
 * No race condition — we wait for loading=false before making any decision.
 * No supabase.auth.* calls here — avoids competing for the auth token Web Lock.
 */
import { useUser } from "../context/UserContext";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { user, loading } = useUser();
  const location = useLocation();

  // UserContext is still resolving the session — show nothing (no flash)
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f0f0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "2px solid #2a2a2a",
            borderTop: "2px solid #c9a96e",
            borderRadius: "50%",
            animation: "admin-spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes admin-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in at all
  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Logged in but not admin
  if (!user.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Confirmed admin — render the protected content
  return children;
}
