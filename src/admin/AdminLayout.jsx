import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";
import { AdminToastProvider } from "./components/Toast";
import "./admin.css";

const NAV = [
  {
    section: "Overview",
    items: [{ label: "Dashboard", to: "/admin", end: true }],
  },
  {
    section: "Catalog",
    items: [
      { label: "Products", to: "/admin/products" },
      { label: "Drops", to: "/admin/drops" },
    ],
  },
  {
    section: "Commerce",
    items: [
      { label: "Orders", to: "/admin/orders" },
      { label: "Customers", to: "/admin/customers" },
      { label: "Discounts", to: "/admin/discounts" },
    ],
  },
  {
    section: "Content",
    items: [
      { label: "Homepage", to: "/admin/homepage" },
      { label: "Pages", to: "/admin/pages" },
      { label: "Media", to: "/admin/media" },
    ],
  },
  {
    section: "Marketing",
    items: [{ label: "Broadcasts", to: "/admin/broadcasts" }],
  },
];

const TITLES = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "New product",
  "/admin/drops": "Drops",
  "/admin/drops/new": "New drop",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/discounts": "Discount codes",
  "/admin/homepage": "Homepage",
  "/admin/pages": "Pages",
  "/admin/media": "Media library",
  "/admin/broadcasts": "Broadcasts",
};

function pageTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/admin/products/")) return "Edit product";
  if (pathname.startsWith("/admin/drops/")) return "Edit drop";
  if (pathname.startsWith("/admin/orders/")) return "Order detail";
  if (pathname.startsWith("/admin/customers/")) return "Customer detail";
  if (pathname.startsWith("/admin/pages/")) return "Edit page";
  return "Admin";
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <AdminToastProvider>
      <div className="admin-root" style={{ display: "flex", minHeight: "100vh" }}>
        <aside
          style={{
            width: "220px",
            background: "#0f0f0f",
            color: "#f0f0f0",
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
          }}
        >
          <div
            style={{
              padding: "1.5rem 1.25rem",
              fontFamily: "'Oswald', sans-serif",
              fontSize: "0.95rem",
              letterSpacing: "3px",
              color: "#f0f0f0",
              borderBottom: "0.5px solid #1f1f1f",
            }}
          >
            STYLE ETERNAL
          </div>

          <nav style={{ flex: 1, padding: "1rem 0", overflowY: "auto" }}>
            {NAV.map((group) => (
              <div key={group.section} style={{ marginBottom: "1.25rem" }}>
                <div
                  style={{
                    padding: "0 1.25rem",
                    fontSize: "0.65rem",
                    letterSpacing: "0.15em",
                    color: "#6b6b6b",
                    textTransform: "uppercase",
                    marginBottom: "0.4rem",
                  }}
                >
                  {group.section}
                </div>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    style={({ isActive }) => ({
                      display: "block",
                      padding: "0.55rem 1.25rem",
                      color: isActive ? "#f0f0f0" : "#bdbdbd",
                      fontSize: "0.85rem",
                      textDecoration: "none",
                      borderLeft: isActive ? "2px solid #c9a96e" : "2px solid transparent",
                      background: isActive ? "rgba(201, 169, 110, 0.08)" : "transparent",
                    })}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <button
            type="button"
            onClick={signOut}
            style={{
              margin: "0.75rem 1.25rem 1.25rem",
              padding: "0.55rem 0.75rem",
              background: "transparent",
              color: "#bdbdbd",
              border: "0.5px solid #2a2a2a",
              fontSize: "0.8rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </aside>

        <main style={{ marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              height: "56px",
              background: "#fff",
              borderBottom: "0.5px solid #e5e3de",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 2rem",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "1rem",
                color: "#1a1a1a",
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
            >
              {pageTitle(location.pathname)}
            </h1>
            <div style={{ fontSize: "0.8rem", color: "#6b6b6b" }}>{user?.email}</div>
          </div>

          <div style={{ flex: 1, padding: "2rem", background: "#f7f6f3" }}>
            <Outlet />
          </div>
        </main>
      </div>
    </AdminToastProvider>
  );
}
