import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useUser } from "./context/UserContext";
import { RecentlyViewedProvider } from "./context/RecentlyViewedContext";
import { ProductsProvider } from "./context/ProductsContext";
import { WishlistProvider } from "./context/WishlistContext";
import CookieBanner from "./components/legal/CookieBanner";
import TrackingScripts from "./components/TrackingScripts";
const CartDrawer = lazy(() => import("./components/CartDrawer"));
const DiscountModal = lazy(() => import("./components/DiscountModal"));
const EmailPopup = lazy(() => import("./components/EmailPopup"));
const StylistChat = lazy(() => import("./components/StylistChat"));
import useRouteAnalytics from "./hooks/useRouteAnalytics";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// Auth gating
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteSkeleton from "./components/RouteSkeleton";

// Lazy pages
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Collections = lazy(() => import("./pages/Collections"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail"));
const Drops = lazy(() => import("./pages/Drops"));
const DropDetail = lazy(() => import("./pages/DropDetail"));
const Editorial = lazy(() => import("./pages/Editorial"));
const Community = lazy(() => import("./pages/Community"));
const About = lazy(() => import("./pages/About"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Cart = lazy(() => import("./pages/Cart"));
const Success = lazy(() => import("./pages/Success"));
const Cancel = lazy(() => import("./pages/Cancel"));
const Account = lazy(() => import("./pages/Account"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const ClientServices = lazy(() => import("./pages/ClientServices"));
const Faqs = lazy(() => import("./pages/Faqs"));
const Privacy = lazy(() => import("./pages/Privacy"));
const PrivacyChoices = lazy(() => import("./pages/PrivacyChoices"));
const Terms = lazy(() => import("./pages/Terms"));
const Returns = lazy(() => import("./pages/Returns"));
const Rewards = lazy(() => import("./pages/Rewards"));
const Shipping = lazy(() => import("./pages/Shipping"));
const SizeGuide = lazy(() => import("./pages/SizeGuide"));
const Lookbook = lazy(() => import("./pages/Lookbook"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin panel (lazy — never loaded for storefront visitors)
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./admin/AdminProductForm"));
const AdminDrops = lazy(() => import("./admin/AdminDrops"));
const AdminDropForm = lazy(() => import("./admin/AdminDropForm"));
const AdminPages = lazy(() => import("./admin/AdminPages"));
const AdminPageEditor = lazy(() => import("./admin/AdminPageEditor"));
const AdminMedia = lazy(() => import("./admin/AdminMedia"));
const AdminHomepage = lazy(() => import("./admin/AdminHomepage"));
const AdminBroadcasts = lazy(() => import("./admin/AdminBroadcasts"));
const AdminOrders = lazy(() => import("./admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./admin/AdminOrderDetail"));
const AdminCustomers = lazy(() => import("./admin/AdminCustomers"));
const AdminCustomerDetail = lazy(() => import("./admin/AdminCustomerDetail"));
const AdminDiscounts = lazy(() => import("./admin/AdminDiscounts"));
const AdminReviews = lazy(() => import("./admin/AdminReviews"));
const AdminReturns = lazy(() => import("./admin/AdminReturns"));

const STOREFRONT_ROUTES = [
  ["/", Home],
  ["/shop", Shop],
  ["/shop/:category", Shop],
  ["/products/:slug", ProductDetail],
  ["/collections", Collections],
  ["/collections/:slug", CollectionDetail],
  ["/drops", Drops],
  ["/drops/:slug", DropDetail],
  ["/editorial", Editorial],
  ["/community", Community],
  ["/about", About],
  ["/checkout", Checkout],
  ["/cart", Cart],
  ["/success", Success],
  ["/cancel", Cancel],
  ["/account", Account],
  ["/account/reset", ResetPassword],
  ["/wishlist", Wishlist],
  ["/client-services", ClientServices],
  ["/faqs", Faqs],
  ["/privacy", Privacy],
  ["/terms", Terms],
  ["/privacy-choices", PrivacyChoices],
  ["/returns", Returns],
  ["/rewards", Rewards],
  ["/shipping", Shipping],
  ["/size-guide", SizeGuide],
  ["/lookbook", Lookbook],
  ["*", NotFound],
];

/**
 * Storefront routes get a light opacity crossfade between pages. The admin
 * panel renders in its own un-animated tree so admin navigation never
 * remounts the AdminLayout shell (filters, scroll position, form state
 * survive) and never pays the transition delay.
 */
function StorefrontRoutes({ location }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {STOREFRONT_ROUTES.map(([path, Page]) => (
          <Route
            key={path}
            path={path}
            element={
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <Suspense fallback={<RouteSkeleton />}>
                  <Page />
                </Suspense>
              </Motion.div>
            }
          />
        ))}
        <Route path="/new-arrivals" element={<Navigate to="/shop?filter=new" replace />} />
        <Route path="/contact" element={<Navigate to="/client-services" replace />} />
        <Route path="/help" element={<Navigate to="/faqs" replace />} />
        <Route path="/shipping-returns" element={<Navigate to="/returns" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      {/* Admin login — no auth guard (the login page itself handles it) */}
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<RouteSkeleton />}>
            <AdminLogin />
          </Suspense>
        }
      />

      {/* Admin panel — all nested routes guarded by AdminRoute + AdminLayout shell */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Suspense fallback={<RouteSkeleton />}>
              <AdminLayout />
            </Suspense>
          </AdminRoute>
        }
      >
        <Route index element={<Suspense fallback={null}><AdminDashboard /></Suspense>} />
        <Route path="products" element={<Suspense fallback={null}><AdminProducts /></Suspense>} />
        <Route path="products/new" element={<Suspense fallback={null}><AdminProductForm /></Suspense>} />
        <Route path="products/:id" element={<Suspense fallback={null}><AdminProductForm /></Suspense>} />
        <Route path="drops" element={<Suspense fallback={null}><AdminDrops /></Suspense>} />
        <Route path="drops/new" element={<Suspense fallback={null}><AdminDropForm /></Suspense>} />
        <Route path="drops/:id" element={<Suspense fallback={null}><AdminDropForm /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={null}><AdminOrders /></Suspense>} />
        <Route path="orders/:id" element={<Suspense fallback={null}><AdminOrderDetail /></Suspense>} />
        <Route path="returns" element={<Suspense fallback={null}><AdminReturns /></Suspense>} />
        <Route path="customers" element={<Suspense fallback={null}><AdminCustomers /></Suspense>} />
        <Route path="customers/:id" element={<Suspense fallback={null}><AdminCustomerDetail /></Suspense>} />
        <Route path="discounts" element={<Suspense fallback={null}><AdminDiscounts /></Suspense>} />
        <Route path="reviews" element={<Suspense fallback={null}><AdminReviews /></Suspense>} />
        <Route path="pages" element={<Suspense fallback={null}><AdminPages /></Suspense>} />
        <Route path="pages/:key" element={<Suspense fallback={null}><AdminPageEditor /></Suspense>} />
        <Route path="homepage" element={<Suspense fallback={null}><AdminHomepage /></Suspense>} />
        <Route path="media" element={<Suspense fallback={null}><AdminMedia /></Suspense>} />
        <Route path="broadcasts" element={<Suspense fallback={null}><AdminBroadcasts /></Suspense>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  useRouteAnalytics();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const { user } = useUser();

  return (
    <RecentlyViewedProvider>
      <ProductsProvider>
      <WishlistProvider>
      <TrackingScripts />
      <Suspense fallback={null}>
        <CartDrawer />
      </Suspense>
      {!isAdminRoute && (
        <>
          <Suspense fallback={null}>
            <DiscountModal user={user} />
          </Suspense>
          <Suspense fallback={null}>
            <EmailPopup user={user} />
          </Suspense>
        </>
      )}

      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <div>
        {!isAdminRoute && <Navbar />}
        <ScrollToTop />

        <ErrorBoundary>
          <div id="main-content" tabIndex={-1} role="main">
            {isAdminRoute ? <AdminRoutes /> : <StorefrontRoutes location={location} />}
          </div>
        </ErrorBoundary>

        {!isAdminRoute && <CookieBanner />}
        {!isAdminRoute && <Footer />}
      </div>
      {!isAdminRoute && (
        <Suspense fallback={null}>
          <StylistChat />
        </Suspense>
      )}
      </WishlistProvider>
      </ProductsProvider>
    </RecentlyViewedProvider>
  );
}
