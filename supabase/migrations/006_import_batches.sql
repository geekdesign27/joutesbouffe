-- ============================================================
-- CATERINGCALC -- Migration 006 : Import batches (PDF import)
-- ============================================================

-- Table des lots d'import (pour rollback)
CREATE TABLE import_batches (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label       TEXT NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  source_file TEXT,
  item_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Colonnes batch_id sur les tables cibles
ALTER TABLE ingredients ADD COLUMN batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL;
ALTER TABLE recipes ADD COLUMN batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL;
ALTER TABLE fixed_costs ADD COLUMN batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL;
