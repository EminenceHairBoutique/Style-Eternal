-- ============================================================================
-- Style Eternal — Admin v2 / Phase 1: product inventory
-- Adds a per-product low-stock threshold used for inline editing + alerts.
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS low_stock_threshold INT NOT NULL DEFAULT 5;

-- Index to make the dashboard "low stock" scan cheap.
CREATE INDEX IF NOT EXISTS products_stock_idx ON public.products (stock);

-- RLS already configured in 20260530120000_admin_panel.sql:
--   products_public_read  : public can read active rows
--   products_admin_all    : is_admin() can read/write all
-- No new policies needed — inline price/stock edits go through products_admin_all.
