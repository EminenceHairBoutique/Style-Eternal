import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useCart } from "./context/CartContext";
import { useUser } from "./context/UserContext";
import { RecentlyViewedProvider } from "./context/RecentlyViewedContext";
import CookieBanner from "./components/legal/CookieBanner";
import TrackingScripts from "./components/TrackingScripts";
const CartDrawer = lazy(() => import("./components/CartDrawer"));
const DiscountModal = lazy(() => import("./components/DiscountModal"));
const EmailPopup = lazy(() => import("./components/EmailPopup"));
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
const Editorial = lazy(() => import("./pages/Editorial"));
const Community = lazy(() => import("./pages/Community"));
const About = lazy(() => import("./pages/About"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Cart = lazy(() => import("./pages/Cart"));
const Success = lazy(() => import("./pages/Success"));
const Cancel = lazy(() => import("./pages/Cancel"));
const Account = lazy(() => import("./pages/Account"));
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

export default function App() {
  useRouteAnalytics();
  const location = useLocation();
  const { isOpen: isCartOpen } = useCart();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const { user } = useUser();

  return (
    <RecentlyViewedProvider>
      <TrackingScripts />
      <Suspense fallback={null}>
        <CartDrawer />
      </Suspense>
      <Suspense fallback={null}>
        <DiscountModal user={user} />
      </Suspense>
      <Suspense fallback={null}>
        <EmailPopup user={user} />
      </Suspense>

      <div
        className={`transition-all duration-300 ${
          isCartOpen ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        {!isAdminRoute && <Navbar />}
        <ScrollToTop />

        <ErrorBoundary>
          <div id="main-content" tabIndex={-1} role="main">
            <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {[
                ["/", <Home />],
                ["/shop", <Shop />],
                ["/shop/:category", <Shop />],
                ["/products/:slug", <ProductDetail />],
                ["/collections", <Collections />],
                ["/collections/:slug", <CollectionDetail />],
                ["/drops", <Drops />],
                ["/drops/:slug", <CollectionDetail />],
                ["/editorial", <Editorial />],
                ["/community", <Community />],
                ["/about", <About />],
                ["/checkout", <Checkout />],
                ["/cart", <Cart />],
                ["/success", <Success />],
                ["/cancel", <Cancel />],
                ["/account", <Account />],
                ["/client-services", <ClientServices />],
                ["/faqs", <Faqs />],
                ["/privacy", <Privacy />],
                ["/terms", <Terms />],
                ["/privacy-choices", <PrivacyChoices />],
                ["/returns", <Returns />],
                ["/rewards", <Rewards />],
                ["/shipping", <Shipping />],
                ["/size-guide", <SizeGuide />],
                ["/lookbook", <Lookbook />],
                ["*", <NotFound />],
              ].map(([path, element]) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <Motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
                    >
                      <Suspense fallback={<RouteSkeleton />}>
                        {element}
                      </Suspense>
                    </Motion.div>
                  }
                />
              ))}
              <Route path="/new-arrivals" element={<Navigate to="/shop?filter=new" replace />} />
              <Route path="/contact" element={<Navigate to="/client-services" replace />} />
              <Route path="/help" element={<Navigate to="/faqs" replace />} />
              <Route path="/shipping-returns" element={<Navigate to="/returns" replace />} />

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
                <Route path="customers" element={<Suspense fallback={null}><AdminCustomers /></Suspense>} />
                <Route path="customers/:id" element={<Suspense fallback={null}><AdminCustomerDetail /></Suspense>} />
                <Route path="discounts" element={<Suspense fallback={null}><AdminDiscounts /></Suspense>} />
                <Route path="pages" element={<Suspense fallback={null}><AdminPages /></Suspense>} />
                <Route path="pages/:key" element={<Suspense fallback={null}><AdminPageEditor /></Suspense>} />
                <Route path="homepage" element={<Suspense fallback={null}><AdminHomepage /></Suspense>} />
                <Route path="media" element={<Suspense fallback={null}><AdminMedia /></Suspense>} />
                <Route path="broadcasts" element={<Suspense fallback={null}><AdminBroadcasts /></Suspense>} />
              </Route>
            </Routes>
          </AnimatePresence>
          </div>
        </ErrorBoundary>

        {!isAdminRoute && <CookieBanner />}
        {!isAdminRoute && <Footer />}
      </div>
    </RecentlyViewedProvider>
  );
}
