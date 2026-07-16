import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import App from "./App.jsx";

// Self-hosted variable fonts (replaces the render-blocking Google Fonts
// stylesheet — one origin, cache-immutable, font-display: swap built in).
import "@fontsource-variable/oswald";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";

import "./index.css";
import "./lib/sentry.js"; // no-op unless VITE_SENTRY_DSN is set
import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/UserContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* reducedMotion="user": every framer-motion animation respects the
          OS-level prefers-reduced-motion setting automatically. */}
      <MotionConfig reducedMotion="user">
        <UserProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </UserProvider>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>
);
