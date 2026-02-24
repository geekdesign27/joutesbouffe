-- ============================================================
-- Rollback Migration 005 : Supprime tout l'import Gaillard
-- Identifié par le tag [gaillard_import_2026] dans les notes
-- ============================================================

-- 1. Supprimer les compositions (recipe_ingredients) liées aux recettes taguées
DELETE FROM recipe_ingredients
WHERE recipe_id IN (
  SELECT id FROM recipes WHERE notes = '[gaillard_import_2026]'
);

-- 2. Supprimer les recettes
DELETE FROM recipes WHERE notes = '[gaillard_import_2026]';

-- 3. Supprimer les ingrédients
DELETE FROM ingredients WHERE notes = '[gaillard_import_2026]';

-- 4. Supprimer les frais fixes
DELETE FROM fixed_costs WHERE notes = '[gaillard_import_2026]';
