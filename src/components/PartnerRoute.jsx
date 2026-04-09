import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

const isApprovedPartner = (tier, status) => {
  const tierValue = String(tier || "").toLowerCase();
  const statusValue = String(status || "").toLowerCase();

  // Accept a few reasonable values to avoid lockouts.
  if (tierValue === "partner" || tierValue === "wholesale" || tierValue.startsWith("partner_")) return true;
  if (statusValue === "approved" || statusValue === "active") return true;

  return false;
};

export default function PartnerRoute({ children }) {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/account" replace state={{ from: location.pathname }} />;

  const ok = isApprovedPartner(user.accountTier, user.partnerStatus);
  if (!ok) return <Navigate to="/partners" replace />;

  return children;
}
