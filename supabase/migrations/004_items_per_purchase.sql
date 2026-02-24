-- Migration 004: Add 3-level pricing columns (conditionnement → unité → service)
-- items_per_purchase: nb d'unités individuelles par conditionnement (ex: 6 bouteilles par lot)
-- item_volume: contenance d'une unité individuelle (ex: 1.5 pour 1.5L)
-- item_volume_unit: mesure de cette contenance (ex: L, kg, pce)

ALTER TABLE ingredients ADD COLUMN items_per_purchase NUMERIC DEFAULT 1 CHECK (items_per_purchase > 0);
ALTER TABLE ingredients ADD COLUMN item_volume NUMERIC;
ALTER TABLE ingredients ADD COLUMN item_volume_unit TEXT;
