import { useEffect, useState, useMemo } from 'react';
import { useTeamCategoryStore } from '../../stores/useTeamCategoryStore';
import { useRecipeStore } from '../../stores/useRecipeStore';
import { useIngredientStore } from '../../stores/useIngredientStore';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../hooks/useToast';
import { calcProductionCost } from '../../lib/calculations';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const fmt = (v) => `CHF ${Number(v).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function TeamCotisations() {
  const { teamCategories, loading, fetchAll, update } = useTeamCategoryStore();
  const recipes = useRecipeStore((s) => s.recipes);
  const ingredients = useIngredientStore((s) => s.ingredients);
  const toast = useToast();
  const [forms, setForms] = useState(null);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    if (teamCategories.length) {
      setForms(teamCategories.map((tc) => ({ ...tc })));
    }
  }, [teamCategories]);

  const debouncedForms = useDebounce(forms, 500);

  useEffect(() => {
    if (!debouncedForms || !teamCategories.length) return;
    debouncedForms.forEach((form, i) => {
      const original = teamCategories[i];
      if (!original) return;
      if (JSON.stringify(form) === JSON.stringify(original)) return;
      const { id, created_at, ...data } = form;
      update(id, data)
        .then(() => toast.success(`${form.name} sauvegardé`))
        .catch((err) => toast.error(err.message));
    });
  }, [debouncedForms]);

  // Build recipe cost map
  const recipeCostMap = useMemo(() => {
    const ingredientMap = {};
    ingredients.forEach((ing) => { ingredientMap[ing.id] = ing; });
    const map = {};
    recipes.forEach((r) => {
      const ri = r.recipe_ingredients || [];
      map[r.id] = calcProductionCost(ri, ingredientMap);
    });
    return map;
  }, [recipes, ingredients]);

  const recipeOptions = useMemo(() =>
    recipes.map((r) => ({ value: r.id, label: r.name })),
    [recipes]
  );

  // Summary calculations
  const summary = useMemo(() => {
    if (!forms) return null;
    let totalPlayers = 0;
    let totalRevenue = 0;
    let totalDrinkCost = 0;
    let totalMealCost = 0;

    forms.forEach((f) => {
      const players = (f.num_teams || 0) * (f.players_per_team || 0);
      totalPlayers += players;
      totalRevenue += players * (f.fee_per_player || 0);
      if (f.drink_recipe_id && recipeCostMap[f.drink_recipe_id] != null) {
        totalDrinkCost += (f.num_teams || 0) * (f.drink_qty_per_team || 0) * recipeCostMap[f.drink_recipe_id];
      }
      if (f.meal_recipe_id && recipeCostMap[f.meal_recipe_id] != null) {
        totalMealCost += players * (f.meals_per_player || 0) * recipeCostMap[f.meal_recipe_id];
      }
    });

    return {
      totalPlayers,
      totalRevenue,
      totalDrinkCost,
      totalMealCost,
      totalOfferedCost: totalDrinkCost + totalMealCost,
      netBenefit: totalRevenue - totalDrinkCost - totalMealCost,
    };
  }, [forms, recipeCostMap]);

  if (loading || !forms) return <LoadingSpinner />;

  const handleChange = (index, field) => (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForms((prev) => prev.map((f, i) =>
      i === index ? { ...f, [field]: value } : f
    ));
  };

  const handleSelect = (index, field) => (e) => {
    const value = e.target.value || null;
    setForms((prev) => prev.map((f, i) =>
      i === index ? { ...f, [field]: value } : f
    ));
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title">Cotisations équipes</h2>

        <div className="space-y-6 mt-4">
          {forms.map((form, index) => (
            <div key={form.id} className="border border-base-300 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">{form.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Nb d'équipes" hint="Nombre total d'équipes inscrites dans cette catégorie">
                  <Input type="number" value={form.num_teams || ''} onChange={handleChange(index, 'num_teams')} min="0" />
                </FormField>
                <FormField label="Joueurs / équipe" hint="Nombre de joueurs par équipe (utilisé pour calculer les cotisations et les repas)">
                  <Input type="number" value={form.players_per_team || ''} onChange={handleChange(index, 'players_per_team')} min="0" />
                </FormField>
                <FormField label="Cotisation / joueur (CHF)" hint="Montant payé par chaque joueur à l'inscription">
                  <Input type="number" value={form.fee_per_player || ''} onChange={handleChange(index, 'fee_per_player')} min="0" step="0.5" />
                </FormField>
                <FormField label="Boisson offerte" hint="Recette offerte à chaque équipe (ex: mètre de bière). Comptée par équipe, pas par joueur.">
                  <Select
                    options={recipeOptions}
                    placeholder="— Aucune —"
                    value={form.drink_recipe_id || ''}
                    onChange={handleSelect(index, 'drink_recipe_id')}
                  />
                </FormField>
                <FormField label="Qté boisson / équipe" hint="Nombre de portions de la boisson offerte par équipe (ex: 1 mètre par équipe)">
                  <Input type="number" value={form.drink_qty_per_team || ''} onChange={handleChange(index, 'drink_qty_per_team')} min="0" step="0.5" />
                </FormField>
                <FormField label="Repas offert" hint="Recette de repas offerte à chaque joueur individuellement. Comptée par joueur.">
                  <Select
                    options={recipeOptions}
                    placeholder="— Aucun —"
                    value={form.meal_recipe_id || ''}
                    onChange={handleSelect(index, 'meal_recipe_id')}
                  />
                </FormField>
              </div>
              <div className="text-sm text-base-content/60 mt-2">
                {(form.num_teams || 0) * (form.players_per_team || 0)} joueurs — Revenu : {fmt((form.num_teams || 0) * (form.players_per_team || 0) * (form.fee_per_player || 0))}
              </div>
            </div>
          ))}
        </div>

        {summary && (
          <div className="alert alert-info mt-4">
            <div className="flex flex-col gap-1 text-sm">
              <span>Total joueurs : <strong>{summary.totalPlayers}</strong></span>
              <span>Total cotisations : <strong>{fmt(summary.totalRevenue)}</strong></span>
              <span>Coût boissons offertes : <strong>{fmt(summary.totalDrinkCost)}</strong></span>
              <span>Coût repas offerts : <strong>{fmt(summary.totalMealCost)}</strong></span>
              <span className="font-bold">Bénéfice net cotisations : <strong className={summary.netBenefit >= 0 ? 'text-success' : 'text-error'}>{fmt(summary.netBenefit)}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
