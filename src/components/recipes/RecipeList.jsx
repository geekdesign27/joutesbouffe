import { useEffect, useState } from 'react';
import { useRecipeStore } from '../../stores/useRecipeStore';
import { useIngredientStore } from '../../stores/useIngredientStore';
import { useTaxonomyStore } from '../../stores/useTaxonomyStore';
import { useToast } from '../../hooks/useToast';
import { RecipeForm } from './RecipeForm';
import { ConfirmModal } from '../shared/ConfirmModal';
import { FormModal } from '../shared/FormModal';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { MarginBadge } from '../shared/MarginBadge';
import { calcProductionCost, calcMargin } from '../../lib/calculations';
import { RecipeCompositionImport } from './RecipeCompositionImport';

export function RecipeList() {
  const { recipes, loading, fetchAll, remove } = useRecipeStore();
  const { ingredients, fetchAll: fetchIngredients } = useIngredientStore();
  const { getLabelMap, fetchAll: fetchTaxonomies } = useTaxonomyStore();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => { fetchAll(); fetchIngredients(); fetchTaxonomies(); }, [fetchAll, fetchIngredients, fetchTaxonomies]);

  const typeLabels = getLabelMap('recipe_type');

  const ingredientMap = {};
  ingredients.forEach((ing) => { ingredientMap[ing.id] = ing; });

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting.id);
      toast.success('Recette supprimée');
    } catch (err) {
      toast.error(err.message);
    }
    setDeleting(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold">Recettes</h2>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={() => setShowImport(true)}>
            Importer compositions CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
            + Ajouter
          </button>
        </div>
      </div>

      <FormModal
        open={editing !== null}
        title={editing === 'new' ? 'Nouvelle recette' : 'Modifier la recette'}
        onClose={() => setEditing(null)}
        wide
      >
        <RecipeForm
          recipe={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      </FormModal>

      {!recipes.length ? (
        <EmptyState
          title="Aucune recette"
          description="Créez vos recettes pour calculer les marges."
          actionLabel="Ajouter une recette"
          onAction={() => setEditing('new')}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th className="text-right">Prix vente</th>
                <th className="text-right">Coût prod.</th>
                <th>Marge</th>
                <th className="text-right">Invendus est.</th>
                <th className="w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => {
                const ri = recipe.recipe_ingredients || [];
                const cost = calcProductionCost(ri, ingredientMap);
                const margin = calcMargin(recipe.selling_price, cost);
                return (
                  <tr key={recipe.id}>
                    <td className="font-medium">{recipe.name}</td>
                    <td><span className="badge badge-ghost badge-sm">{typeLabels[recipe.type] || recipe.type}</span></td>
                    <td className="text-right font-mono">{Number(recipe.selling_price).toFixed(2)} CHF</td>
                    <td className="text-right font-mono">{cost.toFixed(2)} CHF</td>
                    <td><MarginBadge margin={margin} /></td>
                    <td className="text-right">{recipe.unsold_rate_estimate}%</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-xs" onClick={() => setEditing(recipe)}>Modifier</button>
                        <button className="btn btn-ghost btn-xs text-error" onClick={() => setDeleting(recipe)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!deleting}
        title="Supprimer la recette"
        message={`Voulez-vous vraiment supprimer « ${deleting?.name} » ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      <RecipeCompositionImport
        open={showImport}
        onClose={() => setShowImport(false)}
      />
    </div>
  );
}
