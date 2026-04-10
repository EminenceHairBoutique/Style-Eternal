import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useCart } from "./context/CartContext";
import CookieBanner from "./components/legal/CookieBanner";
import TrackingScripts from "./components/TrackingScripts";
const CartDrawer = lazy(() => import("./components/CartDrawer"));
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
const Contact = lazy(() => import("./pages/Contact"));
const Faqs = lazy(() => import("./pages/Faqs"));
const Privacy = lazy(() => import("./pages/Privacy"));
const PrivacyChoices = lazy(() => import("./pages/PrivacyChoices"));
const Terms = lazy(() => import("./pages/Terms"));
const Returns = lazy(() => import("./pages/Returns"));
const Rewards = lazy(() => import("./pages/Rewards"));
const Shipping = lazy(() => import("./pages/Shipping"));
const SizeGuide = lazy(() => import("./pages/SizeGuide"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  useRouteAnalytics();
  const location = useLocation();
  const { isOpen: isCartOpen } = useCart();

  return (
    <>
      <TrackingScripts />
      <Suspense fallback={null}>
        <CartDrawer />
      </Suspense>

      <div
        className={`transition-all duration-300 ${
          isCartOpen ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        <Navbar />
        <ScrollToTop />

        <ErrorBoundary>
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
                ["/contact", <Contact />],
                ["/faqs", <Faqs />],
                ["/privacy", <Privacy />],
                ["/terms", <Terms />],
                ["/privacy-choices", <PrivacyChoices />],
                ["/returns", <Returns />],
                ["/rewards", <Rewards />],
                ["/shipping", <Shipping />],
                ["/size-guide", <SizeGuide />],
                ["*", <NotFound />],
              ].map(([path, element]) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <Motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <Suspense fallback={<RouteSkeleton />}>
                        {element}
                      </Suspense>
                    </Motion.div>
                  }
                />
              ))}
              <Route path="/new-arrivals" element={<Navigate to="/shop?filter=new" replace />} />
              <Route path="/help" element={<Navigate to="/faqs" replace />} />
              <Route path="/shipping-returns" element={<Navigate to="/returns" replace />} />
            </Routes>
          </AnimatePresence>
        </ErrorBoundary>

        <CookieBanner />
        <Footer />
      </div>
    </>
  );
}
