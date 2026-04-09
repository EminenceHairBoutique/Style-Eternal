import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

// Parsed once at module load time — VITE_ADMIN_EMAILS is a static env value.
// Intentionally fail-closed: if the variable is not set, no one gets access.
const ADMIN_ALLOW = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export default function AdminRoute({ children }) {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/account" replace state={{ from: location.pathname }} />;

  const email = String(user.email || "").toLowerCase();
  if (!ADMIN_ALLOW.length || !ADMIN_ALLOW.includes(email)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
