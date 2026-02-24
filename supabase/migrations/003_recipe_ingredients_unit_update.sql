-- Migration 003: Align recipe_ingredients.unit with ingredient serving_unit
-- This ensures quantities in recipes are expressed in serving units for correct cost calculation.

-- Set unit to serving_unit when available
UPDATE recipe_ingredients ri SET unit = i.serving_unit
FROM ingredients i WHERE ri.ingredient_id = i.id AND i.serving_unit IS NOT NULL AND i.serving_unit != '';

-- Fallback to purchase_unit when no serving_unit is defined
UPDATE recipe_ingredients ri SET unit = i.purchase_unit
FROM ingredients i WHERE ri.ingredient_id = i.id AND (i.serving_unit IS NULL OR i.serving_unit = '');
