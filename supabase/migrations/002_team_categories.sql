CREATE TABLE team_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  num_teams INTEGER DEFAULT 0,
  players_per_team INTEGER DEFAULT 10,
  fee_per_player NUMERIC DEFAULT 0,
  drink_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  drink_qty_per_team NUMERIC DEFAULT 1,
  meal_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  meals_per_player INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO team_categories (name, num_teams, players_per_team, fee_per_player, sort_order) VALUES
  ('Sapeurs', 9, 10, 20, 1),
  ('JSP', 5, 10, 10, 2),
  ('Autres', 4, 10, 20, 3);
