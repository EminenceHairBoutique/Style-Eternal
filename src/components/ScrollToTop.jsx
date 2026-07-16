import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instant, not smooth: smooth-scrolling to top on every navigation drags
    // against the route crossfade and makes navigation feel slower.
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
