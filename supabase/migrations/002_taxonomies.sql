-- ============================================================
-- CATERINGCALC -- Migration 002 : Taxonomies dynamiques
-- ============================================================

-- Table unique pour toutes les taxonomies
CREATE TABLE taxonomies (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type       TEXT NOT NULL,
  value      TEXT NOT NULL,
  label      TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(type, value)
);

-- Index pour les requêtes fréquentes par type
CREATE INDEX idx_taxonomies_type ON taxonomies(type, sort_order);

-- ============================================================
-- SEED : Valeurs existantes
-- ============================================================

-- Unités d'achat (purchase_unit) — 7 valeurs
INSERT INTO taxonomies (type, value, label, sort_order) VALUES
  ('purchase_unit', 'kg',     'kg',     1),
  ('purchase_unit', 'litre',  'litre',  2),
  ('purchase_unit', 'piece',  'pièce',  3),
  ('purchase_unit', 'fut',    'fût',    4),
  ('purchase_unit', 'boite',  'boîte',  5),
  ('purchase_unit', 'sachet', 'sachet', 6),
  ('purchase_unit', 'lot',    'lot',    7);

-- Unités de contenance (serving_unit) — 7 valeurs
INSERT INTO taxonomies (type, value, label, sort_order) VALUES
  ('serving_unit', 'L',   'L',   1),
  ('serving_unit', 'dl',  'dl',  2),
  ('serving_unit', 'cl',  'cl',  3),
  ('serving_unit', 'ml',  'ml',  4),
  ('serving_unit', 'kg',  'kg',  5),
  ('serving_unit', 'g',   'g',   6),
  ('serving_unit', 'pce', 'pce', 7);

-- Catégories d'ingrédients (ingredient_category) — 4 valeurs
INSERT INTO taxonomies (type, value, label, sort_order) VALUES
  ('ingredient_category', 'boisson_froide', 'Boisson froide', 1),
  ('ingredient_category', 'boisson_chaude', 'Boisson chaude', 2),
  ('ingredient_category', 'alimentaire',    'Alimentaire',    3),
  ('ingredient_category', 'consommable',    'Consommable',    4);

-- Types de recettes (recipe_type) — 5 valeurs
INSERT INTO taxonomies (type, value, label, sort_order) VALUES
  ('recipe_type', 'repas',          'Repas',          1),
  ('recipe_type', 'boisson_froide', 'Boisson froide', 2),
  ('recipe_type', 'boisson_chaude', 'Boisson chaude', 3),
  ('recipe_type', 'snack',          'Snack',          4),
  ('recipe_type', 'dessert',        'Dessert',        5);

-- ============================================================
-- Supprimer les CHECK constraints sur ingredients.category et recipes.type
-- pour permettre des valeurs dynamiques
-- ============================================================

ALTER TABLE ingredients DROP CONSTRAINT IF EXISTS ingredients_category_check;
ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_type_check;
