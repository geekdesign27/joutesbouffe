-- ============================================================
-- Migration 005 : Import commande Gaillard (offre 06.2026)
-- Tag: [gaillard_import_2026] dans le champ notes pour rollback
-- Rollback: voir 005b_rollback_gaillard.sql
-- ============================================================

DO $$
DECLARE
  v_sup UUID;
  -- Ingredient IDs
  v_cardinal_fut UUID;
  v_coca UUID;
  v_coca_zero UUID;
  v_the_citron UUID;
  v_the_peche UUID;
  v_fanta UUID;
  v_seven_up UUID;
  v_rivella UUID;
  v_limonade UUID;
  v_martini UUID;
  v_trojka UUID;
  v_gob_3dl UUID;
  v_gob_liqueur UUID;
  v_gob_cristal UUID;
  v_gob_longdrink UUID;
  v_assiette_creuse UUID;
  v_assiette_24 UUID;
  v_papier UUID;
  -- Recipe IDs
  v_r UUID;
BEGIN

  -- =============================================
  -- 0. Trouver le fournisseur Gaillard
  -- =============================================
  SELECT id INTO v_sup FROM suppliers WHERE name ILIKE '%gaillard%' LIMIT 1;
  IF v_sup IS NULL THEN
    RAISE EXCEPTION 'Fournisseur Gaillard introuvable — créez-le d''abord';
  END IF;

  -- =============================================
  -- 1. INGREDIENTS — Boissons
  -- =============================================

  -- Fût Cardinal Lager Blonde (20L)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, item_volume, item_volume_unit, serving_unit, serving_quantity,
    returnable, returnable_condition, perishable, category, notes)
  VALUES ('Fût Cardinal Lager Blonde', v_sup, 'fut', 1, 90.00,
    1, 20, 'L', 'cl', 2000,
    true, 'consigne fût', false, 'bierre_vin', '[gaillard_import_2026]')
  RETURNING id INTO v_cardinal_fut;

  -- Coca-Cola normal (6×1.5L)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, item_volume, item_volume_unit, serving_unit, serving_quantity,
    returnable, returnable_condition, perishable, category, notes)
  VALUES ('Coca-Cola normal', v_sup, 'lot', 1, 2.90,
    6, 1.5, 'L', 'cl', 150,
    true, 'pack non ouvert', false, 'minerale', '[gaillard_import_2026]')
  RETURNING id INTO v_coca;

  -- Coca-Cola zéro (6×1.5L)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, item_volume, item_volume_unit, serving_unit, serving_quantity,
    returnable, returnable_condition, perishable, category, notes)
  VALUES ('Coca-Cola zéro', v_sup, 'lot', 1, 7.90,
    6, 1.5, 'L', 'cl', 150,
    true, 'pack non ouvert', false, 'minerale', '[gaillard_import_2026]')
  RETURNING id INTO v_coca_zero;

  -- Thé froid S.Benedetto Citron (6×1.5L)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, item_volume, item_volume_unit, serving_unit, serving_quantity,
    returnable, returnable_condition, perishable, category, notes)
  VALUES ('Thé froid S.Benedetto Citron', v_sup, 'lot', 1, 10.90,
    6, 1.5, 'L', 'cl', 150,
    true, 'pack non ouvert', false, 'minerale', '[gaillard_import_2026]')
  RETURNING id INTO v_the_citron;

  -- Thé froid S.Benedetto Pêche (6×1.5L)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, item_volume, item_volume_unit, serving_unit, serving_quantity,
    returnable, returnable_condition, perishable, category, notes)
  VALUES ('Thé froid S.Benedetto Pêche', v_sup, 'lot', 1, 10.90,
    6, 1.5, 'L', 'cl', 150,
    true, 'pack non ouvert', false, 'minerale', '[gaillard_import_2026]')
  RETURNING id INTO v_the_peche;

  -- Fanta orange (6×1.5L)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, item_volume, item_volume_unit, serving_unit, serving_quantity,
    returnable, returnable_condition, perishable, category, notes)
  VALUES ('Fanta orange', v_sup, 'lot', 1, 11.00,
    6, 1.5, 'L', 'cl', 150,
    true, 'pack non ouvert', false, 'minerale', '[gaillard_import_2026]')
  RETURNING id INTO v_fanta;

  -- Seven Up (6×1.5L)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, item_volume, item_volume_unit, serving_unit, serving_quantity,
    returnable, returnable_condition, perishable, category, notes)
  VALUES ('Seven Up', v_sup, 'lot', 1, 11.00,
    6, 1.5, 'L', 'cl', 150,
    true, 'pack non ouvert', false, 'minerale', '[gaillard_import_2026]')
  RETURNING id INTO v_seven_up;

  -- Rivella rouge (6×1.5L)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, item_volume, item_volume_unit, serving_unit, serving_quantity,
    returnable, returnable_condition, perishable, category, notes)
  VALUES ('Rivella rouge', v_sup, 'lot', 1, 15.00,
    6, 1.5, 'L', 'cl', 150,
    true, 'pack non ouvert', false, 'minerale', '[gaillard_import_2026]')
  RETURNING id INTO v_rivella;

  -- Limonade citron Zurzacher (6×1.5L)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, item_volume, item_volume_unit, serving_unit, serving_quantity,
    returnable, returnable_condition, perishable, category, notes)
  VALUES ('Limonade citron Zurzacher', v_sup, 'lot', 1, 6.90,
    6, 1.5, 'L', 'cl', 150,
    true, 'pack non ouvert', false, 'minerale', '[gaillard_import_2026]')
  RETURNING id INTO v_limonade;

  -- Martini blanc (100cl)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, item_volume, item_volume_unit, serving_unit, serving_quantity,
    returnable, returnable_condition, perishable, category, notes)
  VALUES ('Martini blanc', v_sup, 'piece', 1, 12.90,
    1, 1, 'L', 'cl', 100,
    true, 'bouteille non ouverte', false, 'alcool_fort', '[gaillard_import_2026]')
  RETURNING id INTO v_martini;

  -- Trojka Vodka blanche (100cl)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, item_volume, item_volume_unit, serving_unit, serving_quantity,
    returnable, returnable_condition, perishable, category, notes)
  VALUES ('Trojka Vodka blanche', v_sup, 'piece', 1, 24.90,
    1, 1, 'L', 'cl', 100,
    true, 'bouteille non ouverte', false, 'alcool_fort', '[gaillard_import_2026]')
  RETURNING id INTO v_trojka;

  -- =============================================
  -- 2. INGREDIENTS — Consommables
  -- =============================================

  -- Gobelet 3dl Cardinal (50 pces/lot)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, serving_unit, serving_quantity,
    returnable, perishable, category, notes)
  VALUES ('Gobelet 3dl Cardinal', v_sup, 'lot', 1, 6.00,
    50, 'pce', 1,
    false, false, 'consommable', '[gaillard_import_2026]')
  RETURNING id INTO v_gob_3dl;

  -- Gobelet liqueur (50 pces/lot)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, serving_unit, serving_quantity,
    returnable, perishable, category, notes)
  VALUES ('Gobelet liqueur', v_sup, 'lot', 1, 9.95,
    50, 'pce', 1,
    false, false, 'consommable', '[gaillard_import_2026]')
  RETURNING id INTO v_gob_liqueur;

  -- Gobelet cristal 1dl (40 pces/lot)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, serving_unit, serving_quantity,
    returnable, perishable, category, notes)
  VALUES ('Gobelet cristal 1dl', v_sup, 'lot', 1, 5.95,
    40, 'pce', 1,
    false, false, 'consommable', '[gaillard_import_2026]')
  RETURNING id INTO v_gob_cristal;

  -- Gobelets longdrink (10 pces/lot)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, serving_unit, serving_quantity,
    returnable, perishable, category, notes)
  VALUES ('Gobelet longdrink', v_sup, 'lot', 1, 2.95,
    10, 'pce', 1,
    false, false, 'consommable', '[gaillard_import_2026]')
  RETURNING id INTO v_gob_longdrink;

  -- Assiettes creuses (50 pces/lot)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, serving_unit, serving_quantity,
    returnable, perishable, category, notes)
  VALUES ('Assiette creuse', v_sup, 'lot', 1, 11.40,
    50, 'pce', 1,
    false, false, 'consommable', '[gaillard_import_2026]')
  RETURNING id INTO v_assiette_creuse;

  -- Assiettes 24cm (50 pces/lot)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, serving_unit, serving_quantity,
    returnable, perishable, category, notes)
  VALUES ('Assiette 24cm', v_sup, 'lot', 1, 9.90,
    50, 'pce', 1,
    false, false, 'consommable', '[gaillard_import_2026]')
  RETURNING id INTO v_assiette_24;

  -- Papier ménage (50 pces/lot)
  INSERT INTO ingredients (name, supplier_id, purchase_unit, purchase_quantity, purchase_price,
    items_per_purchase, serving_unit, serving_quantity,
    returnable, perishable, category, notes)
  VALUES ('Papier ménage', v_sup, 'lot', 1, 4.50,
    50, 'pce', 1,
    false, false, 'consommable', '[gaillard_import_2026]')
  RETURNING id INTO v_papier;

  -- =============================================
  -- 3. RECETTES — Bières
  -- =============================================

  -- Bière pression 3dl (30cl Cardinal + 1 gobelet 3dl)
  INSERT INTO recipes (name, type, selling_price, notes)
  VALUES ('Bière pression 3dl', 'bierre_vin', 0, '[gaillard_import_2026]')
  RETURNING id INTO v_r;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_used, unit)
  VALUES (v_r, v_cardinal_fut, 30, 'cl'),
         (v_r, v_gob_3dl, 1, 'pce');

  -- =============================================
  -- 4. RECETTES — Minérales (33cl + gobelet 3dl)
  -- =============================================

  -- Coca-Cola 3dl
  INSERT INTO recipes (name, type, selling_price, notes)
  VALUES ('Coca-Cola 3dl', 'minerale', 0, '[gaillard_import_2026]')
  RETURNING id INTO v_r;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_used, unit)
  VALUES (v_r, v_coca, 33, 'cl'),
         (v_r, v_gob_3dl, 1, 'pce');

  -- Coca-Cola zéro 3dl
  INSERT INTO recipes (name, type, selling_price, notes)
  VALUES ('Coca-Cola zéro 3dl', 'minerale', 0, '[gaillard_import_2026]')
  RETURNING id INTO v_r;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_used, unit)
  VALUES (v_r, v_coca_zero, 33, 'cl'),
         (v_r, v_gob_3dl, 1, 'pce');

  -- Thé froid citron 3dl
  INSERT INTO recipes (name, type, selling_price, notes)
  VALUES ('Thé froid citron 3dl', 'minerale', 0, '[gaillard_import_2026]')
  RETURNING id INTO v_r;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_used, unit)
  VALUES (v_r, v_the_citron, 33, 'cl'),
         (v_r, v_gob_3dl, 1, 'pce');

  -- Thé froid pêche 3dl
  INSERT INTO recipes (name, type, selling_price, notes)
  VALUES ('Thé froid pêche 3dl', 'minerale', 0, '[gaillard_import_2026]')
  RETURNING id INTO v_r;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_used, unit)
  VALUES (v_r, v_the_peche, 33, 'cl'),
         (v_r, v_gob_3dl, 1, 'pce');

  -- Fanta 3dl
  INSERT INTO recipes (name, type, selling_price, notes)
  VALUES ('Fanta 3dl', 'minerale', 0, '[gaillard_import_2026]')
  RETURNING id INTO v_r;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_used, unit)
  VALUES (v_r, v_fanta, 33, 'cl'),
         (v_r, v_gob_3dl, 1, 'pce');

  -- Seven Up 3dl
  INSERT INTO recipes (name, type, selling_price, notes)
  VALUES ('Seven Up 3dl', 'minerale', 0, '[gaillard_import_2026]')
  RETURNING id INTO v_r;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_used, unit)
  VALUES (v_r, v_seven_up, 33, 'cl'),
         (v_r, v_gob_3dl, 1, 'pce');

  -- Rivella rouge 3dl
  INSERT INTO recipes (name, type, selling_price, notes)
  VALUES ('Rivella rouge 3dl', 'minerale', 0, '[gaillard_import_2026]')
  RETURNING id INTO v_r;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_used, unit)
  VALUES (v_r, v_rivella, 33, 'cl'),
         (v_r, v_gob_3dl, 1, 'pce');

  -- Limonade citron 3dl
  INSERT INTO recipes (name, type, selling_price, notes)
  VALUES ('Limonade citron 3dl', 'minerale', 0, '[gaillard_import_2026]')
  RETURNING id INTO v_r;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_used, unit)
  VALUES (v_r, v_limonade, 33, 'cl'),
         (v_r, v_gob_3dl, 1, 'pce');

  -- =============================================
  -- 5. RECETTES — Spiritueux
  -- =============================================

  -- Martini blanc (10cl + gobelet cristal 1dl)
  INSERT INTO recipes (name, type, selling_price, notes)
  VALUES ('Martini blanc', 'spiritueux', 0, '[gaillard_import_2026]')
  RETURNING id INTO v_r;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_used, unit)
  VALUES (v_r, v_martini, 10, 'cl'),
         (v_r, v_gob_cristal, 1, 'pce');

  -- Shot Trojka (4cl + gobelet liqueur)
  INSERT INTO recipes (name, type, selling_price, notes)
  VALUES ('Shot Trojka', 'spiritueux', 0, '[gaillard_import_2026]')
  RETURNING id INTO v_r;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_used, unit)
  VALUES (v_r, v_trojka, 4, 'cl'),
         (v_r, v_gob_liqueur, 1, 'pce');

  -- =============================================
  -- 6. FRAIS FIXES — Location Gaillard
  -- =============================================

  INSERT INTO fixed_costs (name, supplier_id, amount, category, notes)
  VALUES
    ('Remorque Frigo', v_sup, 250.00, 'location', '[gaillard_import_2026]'),
    ('Tireuses bière double ×2', v_sup, 120.00, 'location', '[gaillard_import_2026]'),
    ('Gaz machines à bières ×3', v_sup, 45.00, 'consommable', '[gaillard_import_2026]'),
    ('Transport livraison + retour', v_sup, 50.00, 'transport', '[gaillard_import_2026]');

END $$;
