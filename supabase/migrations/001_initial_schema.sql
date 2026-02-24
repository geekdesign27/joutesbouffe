-- ============================================================
-- CATERINGCALC -- Schema initial v1.0
-- ============================================================

-- 1. FOURNISSEURS
CREATE TABLE suppliers (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  contact     TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INGREDIENTS
CREATE TABLE ingredients (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name                  TEXT NOT NULL,
  supplier_id           UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  purchase_unit         TEXT NOT NULL,
  purchase_quantity     NUMERIC NOT NULL DEFAULT 1 CHECK (purchase_quantity > 0),
  purchase_price        NUMERIC NOT NULL DEFAULT 0 CHECK (purchase_price >= 0),
  unit_price            NUMERIC GENERATED ALWAYS AS (
                          CASE WHEN purchase_quantity > 0
                          THEN purchase_price / purchase_quantity
                          ELSE 0 END
                        ) STORED,
  serving_unit          TEXT,
  serving_quantity      NUMERIC DEFAULT 1,
  waste_rate            NUMERIC DEFAULT 0 CHECK (waste_rate >= 0 AND waste_rate <= 100),
  returnable            BOOLEAN DEFAULT FALSE,
  returnable_condition  TEXT,
  perishable            BOOLEAN DEFAULT FALSE,
  category              TEXT CHECK (category IN (
                          'boisson_froide', 'boisson_chaude', 'alimentaire', 'consommable'
                        )),
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RECETTES
CREATE TABLE recipes (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name                  TEXT NOT NULL,
  type                  TEXT CHECK (type IN (
                          'repas', 'boisson_froide', 'boisson_chaude', 'snack', 'dessert'
                        )),
  selling_price         NUMERIC DEFAULT 0 CHECK (selling_price >= 0),
  is_sellable           BOOLEAN DEFAULT TRUE,
  unsold_rate_estimate  NUMERIC DEFAULT 5 CHECK (
                          unsold_rate_estimate >= 0 AND unsold_rate_estimate <= 100
                        ),
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMPOSITION DES RECETTES
CREATE TABLE recipe_ingredients (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id       UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id   UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity_used   NUMERIC NOT NULL DEFAULT 1 CHECK (quantity_used > 0),
  unit            TEXT NOT NULL,
  UNIQUE(recipe_id, ingredient_id)
);

-- 5. PROFILS DE CONSOMMATEURS
CREATE TABLE profiles (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name                    TEXT NOT NULL,
  type                    TEXT CHECK (type IN (
                            'paying', 'offered', 'shift_based', 'mixed'
                          )),
  has_paying_consumption  BOOLEAN DEFAULT FALSE,
  is_system               BOOLEAN DEFAULT FALSE,
  color                   TEXT DEFAULT '#1E3A5F',
  sort_order              INTEGER DEFAULT 0,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DROITS OFFERTS PAR PROFIL
CREATE TABLE profile_rights (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id           UUID REFERENCES recipes(id) ON DELETE CASCADE,
  recipe_category     TEXT,
  quantity_per_right  NUMERIC NOT NULL DEFAULT 1,
  right_type          TEXT CHECK (right_type IN (
                        'fixed',
                        'per_shift_hours',
                        'per_service_hours'
                      )),
  hours_per_unit      NUMERIC,
  notes               TEXT
);

-- 7. CONSOMMATION PAYANTE ADDITIONNELLE -- PROFILS MIXTES
CREATE TABLE profile_paying_consumption (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_category TEXT NOT NULL,
  scenario        TEXT CHECK (scenario IN ('pessimistic', 'realistic', 'optimistic')),
  rate_per_person NUMERIC DEFAULT 0 CHECK (rate_per_person >= 0),
  notes           TEXT,
  UNIQUE(profile_id, recipe_category, scenario)
);

-- 8. CONFIGURATION DE LA MANIFESTATION (1 seule ligne)
CREATE TABLE event_config (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name              TEXT DEFAULT 'Joutes Inter-Pompiers',
  event_date              DATE,
  start_time              TEXT DEFAULT '12:30',
  end_time                TEXT DEFAULT '02:00',
  shift_duration_hours    NUMERIC DEFAULT 6,
  service_interval_hours  NUMERIC DEFAULT 3,
  total_teams             INTEGER DEFAULT 18,
  players_per_team        INTEGER DEFAULT 10,
  total_referees          INTEGER DEFAULT 24,
  beverages_per_referee   INTEGER DEFAULT 5,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ESTIMATIONS DE FREQUENTATION PAR PROFIL ET SCENARIO
CREATE TABLE headcount_estimates (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scenario        TEXT CHECK (scenario IN ('pessimistic', 'realistic', 'optimistic')),
  count           INTEGER DEFAULT 0 CHECK (count >= 0),
  variation_pct   NUMERIC DEFAULT 0,
  UNIQUE(profile_id, scenario)
);

-- 10. SHIFTS BENEVOLES PAR SCENARIO
CREATE TABLE volunteer_shifts (
  id                        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario                  TEXT CHECK (scenario IN ('pessimistic', 'realistic', 'optimistic')),
  volunteers_1_shift        INTEGER DEFAULT 0,
  volunteers_2_shifts       INTEGER DEFAULT 0,
  volunteers_3_shifts       INTEGER DEFAULT 0,
  consumption_variation_pct NUMERIC DEFAULT 0,
  UNIQUE(scenario)
);

-- 11. TAUX DE CONSOMMATION PAR PROFIL PAYANT, CATEGORIE ET SCENARIO
CREATE TABLE consumption_rates (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_category TEXT NOT NULL,
  scenario        TEXT CHECK (scenario IN ('pessimistic', 'realistic', 'optimistic')),
  rate_per_person NUMERIC DEFAULT 0,
  UNIQUE(profile_id, recipe_category, scenario)
);

-- 12. COUTS FIXES
CREATE TABLE fixed_costs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  amount      NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0),
  category    TEXT CHECK (category IN ('location', 'consommable', 'transport', 'autre')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED : DONNEES PAR DEFAUT
-- ============================================================

-- Profils systeme (non supprimables)
INSERT INTO profiles (name, type, has_paying_consumption, is_system, color, sort_order)
VALUES
  ('Visiteur public',       'paying',     FALSE, TRUE, '#2ECC71', 1),
  ('Pompier participant',   'mixed',      TRUE,  TRUE, '#E74C3C', 2),
  ('Arbitre',               'mixed',      TRUE,  TRUE, '#3498DB', 3),
  ('Benevole',              'shift_based',FALSE, TRUE, '#F39C12', 4);

-- Configuration par defaut
INSERT INTO event_config (event_name)
VALUES ('Joutes Inter-Pompiers');

-- Shifts benevoles vides pour les 3 scenarios
INSERT INTO volunteer_shifts (scenario)
VALUES ('pessimistic'), ('realistic'), ('optimistic');

-- Headcount vides pour les 4 profils et 3 scenarios
INSERT INTO headcount_estimates (profile_id, scenario, count)
SELECT p.id, s.scenario, 0
FROM profiles p
CROSS JOIN (VALUES ('pessimistic'),('realistic'),('optimistic')) AS s(scenario);
