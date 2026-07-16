// src/utils/captureGovernor.js
// One interruption per session. The storefront has several email-capture
// surfaces (discount modal, email popup, hero + footer forms); the governor
// guarantees at most ONE modal interrupts a visitor per session, and never
// on purchase-intent routes.

const SESSION_KEY = "se_capture_shown";

// Routes where interrupting a visitor risks a sale.
const SUPPRESSED_PATTERNS = [/^\/checkout/, /^\/cart/, /^\/success/, /^\/products\//];

export function isSuppressedPath(pathname = "") {
  return SUPPRESSED_PATTERNS.some((re) => re.test(pathname));
}

/** True if a capture modal may open right now. */
export function canShowCapture(pathname) {
  if (isSuppressedPath(pathname)) return false;
  try {
    return !sessionStorage.getItem(SESSION_KEY);
  } catch {
    return true;
  }
}

/** Record that a capture modal was shown this session. */
export function markCaptureShown() {
  try {
    sessionStorage.setItem(SESSION_KEY, "true");
  } catch { /* ignore */ }
}
