// src/lib/sentry.js — production error reporting.
// No-op unless VITE_SENTRY_DSN is set, so local dev and forks run clean.
// ErrorBoundary.componentDidCatch reports through here as well.

import * as Sentry from "@sentry/react";

const dsn = import.meta.env?.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

export function captureException(error, extra) {
  if (!dsn) return;
  Sentry.captureException(error, extra ? { extra } : undefined);
}
