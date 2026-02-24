import { useState, useEffect } from 'react';
import { useRecipeStore } from '../../stores/useRecipeStore';
import { useTaxonomyStore } from '../../stores/useTaxonomyStore';
import { useToast } from '../../hooks/useToast';
import { RecipeBuilder } from './RecipeBuilder';
import { RecipeCostPanel } from './RecipeCostPanel';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Textarea } from '../ui/Textarea';

export function RecipeForm({ recipe, onClose }) {
  const { recipes, create, update, bulkAddIngredients } = useRecipeStore();
  const { getOptions, fetchAll: fetchTaxonomies } = useTaxonomyStore();
  const toast = useToast();

  useEffect(() => { fetchTaxonomies(); }, [fetchTaxonomies]);

  const typeOptions = getOptions('recipe_type');
  const isEdit = !!recipe;

  const [form, setForm] = useState({
    name: recipe?.name || '',
    type: recipe?.type || 'repas',
    selling_price: recipe?.selling_price || 0,
    is_sellable: recipe?.is_sellable ?? true,
    unsold_rate_estimate: recipe?.unsold_rate_estimate || 5,
    notes: recipe?.notes || '',
  });
  const [localIngredients, setLocalIngredients] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked
      : e.target.type === 'number' ? Number(e.target.value)
      : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Le nom est obligatoire'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await update(recipe.id, form);
        toast.success('Recette modifiée');
      } else {
        const newId = await create(form);
        if (localIngredients.length > 0) {
          const rows = localIngredients.map((li) => ({
            recipe_id: newId,
            ingredient_id: li.ingredient_id,
            quantity_used: li.quantity_used,
            unit: li.unit,
          }));
          await bulkAddIngredients(rows);
        }
        toast.success('Recette créée');
      }
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // En mode édition, lire la recette live du store (pas le prop périmé)
  // pour que le cost panel se mette à jour après ajout/modif d'ingrédients
  const liveRecipe = isEdit ? recipes.find((r) => r.id === recipe.id) : null;
  const recipeForCostPanel = {
    recipe_ingredients: isEdit
      ? (liveRecipe?.recipe_ingredients || [])
      : localIngredients,
    selling_price: form.selling_price,
  };

  return (
    <div className="card bg-base-100 shadow-sm mb-4">
      <div className="card-body">
        <h3 className="card-title text-base">{isEdit ? 'Modifier la recette' : 'Nouvelle recette'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Nom" required>
              <Input type="text" value={form.name} onChange={handleChange('name')} required />
            </FormField>
            <FormField label="Type">
              <Select value={form.type} onChange={handleChange('type')} options={typeOptions} />
            </FormField>
            <FormField label="Prix de vente (CHF)">
              <Input type="number" value={form.selling_price} onChange={handleChange('selling_price')} min="0" step="0.5" />
            </FormField>
            <FormField label="Taux invendus estimé (%)">
              <Input type="number" value={form.unsold_rate_estimate} onChange={handleChange('unsold_rate_estimate')} min="0" max="100" step="1" />
            </FormField>
            <div className="flex items-end">
              <Checkbox label="Produit vendable" checked={form.is_sellable} onChange={handleChange('is_sellable')} />
            </div>
          </div>
          <FormField label="Notes">
            <Textarea value={form.notes} onChange={handleChange('notes')} rows="2" />
          </FormField>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <RecipeBuilder
              recipeId={isEdit ? recipe.id : null}
              localIngredients={isEdit ? undefined : localIngredients}
              onLocalChange={isEdit ? undefined : setLocalIngredients}
            />
            <RecipeCostPanel recipe={recipeForCostPanel} />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? <span className="loading loading-spinner loading-xs" /> : null}
              {isEdit ? 'Enregistrer' : 'Créer'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
