import { useState, useEffect } from 'react';
import { useRecipeStore } from '../../stores/useRecipeStore';
import { useIngredientStore } from '../../stores/useIngredientStore';
import { useToast } from '../../hooks/useToast';
import { calcLineItemCost, calcServingUnitPrice } from '../../lib/calculations';

export function RecipeBuilder({ recipeId, localIngredients, onLocalChange }) {
  const { recipes, addIngredient, updateIngredient, removeIngredient } = useRecipeStore();
  const { ingredients, fetchAll: fetchIngredients } = useIngredientStore();
  const toast = useToast();

  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => { fetchIngredients(); }, [fetchIngredients]);

  const isPersisted = !!recipeId;
  const recipe = isPersisted ? recipes.find((r) => r.id === recipeId) : null;
  const recipeIngredients = isPersisted
    ? (recipe?.recipe_ingredients || [])
    : (localIngredients || []);

  const ingredientMap = {};
  ingredients.forEach((ing) => { ingredientMap[ing.id] = ing; });

  const usedIngredientIds = recipeIngredients.map((ri) => ri.ingredient_id);
  const availableIngredients = ingredients.filter((i) => !usedIngredientIds.includes(i.id));

  const getIngredientUnit = (ingredientId) => {
    const ing = ingredientMap[ingredientId];
    if (!ing) return 'pce';
    return ing.serving_unit || ing.purchase_unit || 'pce';
  };

  const handleAdd = async () => {
    if (!selectedIngredient) { toast.error('Sélectionnez un ingrédient'); return; }
    const unit = getIngredientUnit(selectedIngredient);

    if (isPersisted) {
      try {
        await addIngredient(recipeId, selectedIngredient, quantity, unit);
        toast.success('Ingrédient ajouté à la recette');
      } catch (err) {
        toast.error(err.message);
        return;
      }
    } else {
      const newRow = {
        _localId: crypto.randomUUID(),
        ingredient_id: selectedIngredient,
        quantity_used: quantity,
        unit,
      };
      onLocalChange([...recipeIngredients, newRow]);
    }
    setSelectedIngredient('');
    setQuantity(1);
  };

  const handleUpdateQty = async (riIdOrLocalId, newQty) => {
    if (newQty <= 0) return;
    if (isPersisted) {
      try {
        await updateIngredient(riIdOrLocalId, { quantity_used: newQty });
      } catch (err) {
        toast.error(err.message);
      }
    } else {
      onLocalChange(recipeIngredients.map((ri) =>
        ri._localId === riIdOrLocalId ? { ...ri, quantity_used: newQty } : ri
      ));
    }
  };

  const handleRemove = async (riIdOrLocalId) => {
    if (isPersisted) {
      try {
        await removeIngredient(riIdOrLocalId);
        toast.success('Ingrédient retiré');
      } catch (err) {
        toast.error(err.message);
      }
    } else {
      onLocalChange(recipeIngredients.filter((ri) => ri._localId !== riIdOrLocalId));
    }
  };

  return (
    <div className="border border-base-300 rounded-lg p-4">
      <h4 className="font-semibold mb-3">Composition</h4>

      {recipeIngredients.length > 0 && (
        <div className="space-y-2 mb-4">
          {recipeIngredients.map((ri) => {
            const key = isPersisted ? ri.id : ri._localId;
            const ing = ri.ingredient || ingredientMap[ri.ingredient_id];
            const lineInfo = ing ? calcLineItemCost(ri, ing) : null;
            return (
              <div key={key} className="flex items-center gap-2 bg-base-200 rounded-lg p-2">
                <span className="flex-1 text-sm font-medium">{ing?.name || 'Inconnu'}</span>
                <input
                  type="number"
                  className="input input-xs w-20 text-right font-mono"
                  value={ri.quantity_used}
                  onChange={(e) => handleUpdateQty(key, Number(e.target.value))}
                  min="0.01"
                  step="0.01"
                />
                <span className="text-xs text-base-content/60 w-10">{ri.unit}</span>
                {lineInfo && (
                  <span className="text-xs font-mono text-base-content/70 w-20 text-right">
                    {lineInfo.lineCost.toFixed(2)} CHF
                  </span>
                )}
                <button className="btn btn-ghost btn-xs text-error" onClick={() => handleRemove(key)}>×</button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <select
          className="select select-sm flex-1"
          value={selectedIngredient}
          onChange={(e) => {
            setSelectedIngredient(e.target.value);
          }}
        >
          <option value="">— Ajouter un ingrédient —</option>
          {availableIngredients.map((ing) => {
            const unit = ing.serving_unit || ing.purchase_unit;
            const pricePerUnit = calcServingUnitPrice(ing);
            const priceStr = pricePerUnit < 0.01
              ? pricePerUnit.toFixed(4)
              : pricePerUnit.toFixed(2);
            return (
              <option key={ing.id} value={ing.id}>
                {ing.name} — {priceStr} CHF/{unit}
              </option>
            );
          })}
        </select>
        <input
          type="number"
          className="input input-sm w-20"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min="0.01"
          step="0.01"
        />
        <span className="text-xs text-base-content/60 self-center w-10">
          {selectedIngredient ? getIngredientUnit(selectedIngredient) : ''}
        </span>
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>+</button>
      </div>
    </div>
  );
}
