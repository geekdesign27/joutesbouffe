import { useState } from 'react';
import { usePdfImportStore } from '../../stores/usePdfImportStore';
import { useTaxonomyStore } from '../../stores/useTaxonomyStore';
import { useToast } from '../../hooks/useToast';

const FIXED_COST_CATEGORIES = [
  { value: 'location', label: 'Location' },
  { value: 'consommable', label: 'Consommable' },
  { value: 'transport', label: 'Transport' },
  { value: 'autre', label: 'Autre' },
];

export function PdfReviewStep() {
  const {
    parsedIngredients,
    parsedRecipes,
    parsedFixedCosts,
    updateParsedIngredient,
    removeParsedIngredient,
    updateParsedRecipe,
    removeParsedRecipe,
    updateParsedFixedCost,
    removeParsedFixedCost,
    executeBatchImport,
    setStep,
    loading,
    error,
  } = usePdfImportStore();

  const taxonomyStore = useTaxonomyStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('ingredients');
  const [batchLabel, setBatchLabel] = useState('');

  const ingredientCategories = taxonomyStore.getOptions('ingredient_category');
  const purchaseUnits = taxonomyStore.getOptions('purchase_unit');
  const servingUnits = taxonomyStore.getOptions('serving_unit');
  const recipeTypes = taxonomyStore.getOptions('recipe_type');

  const totalItems =
    parsedIngredients.length + parsedRecipes.length + parsedFixedCosts.length;

  const handleImport = async () => {
    const label = batchLabel.trim() || `Import ${new Date().toLocaleDateString('fr-CH')}`;
    try {
      await executeBatchImport(label);
      toast.success(`Import réussi : ${totalItems} éléments importés`);
    } catch (err) {
      toast.error(`Erreur import : ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="tabs tabs-border">
        <button
          className={`tab ${activeTab === 'ingredients' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('ingredients')}
        >
          Ingrédients ({parsedIngredients.length})
        </button>
        <button
          className={`tab ${activeTab === 'recipes' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('recipes')}
        >
          Recettes ({parsedRecipes.length})
        </button>
        <button
          className={`tab ${activeTab === 'fixed_costs' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('fixed_costs')}
        >
          Coûts fixes ({parsedFixedCosts.length})
        </button>
      </div>

      {/* Ingredients tab */}
      {activeTab === 'ingredients' && (
        <div className="overflow-x-auto">
          <table className="table table-xs">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Cond.</th>
                <th>Prix</th>
                <th>Unités/cond.</th>
                <th>Contenance</th>
                <th>Mesure</th>
                <th>Unité service</th>
                <th>Retournable</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {parsedIngredients.map((item) => (
                <tr key={item._tempId}>
                  <td>
                    <input
                      className="input input-xs w-40"
                      value={item.name || ''}
                      onChange={(e) =>
                        updateParsedIngredient(item._tempId, {
                          name: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="select select-xs w-32"
                      value={item.category || ''}
                      onChange={(e) =>
                        updateParsedIngredient(item._tempId, {
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="">--</option>
                      {ingredientCategories.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="select select-xs w-24"
                      value={item.purchase_unit || ''}
                      onChange={(e) =>
                        updateParsedIngredient(item._tempId, {
                          purchase_unit: e.target.value,
                        })
                      }
                    >
                      <option value="">--</option>
                      {purchaseUnits.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input input-xs w-20"
                      value={item.purchase_price ?? ''}
                      onChange={(e) =>
                        updateParsedIngredient(item._tempId, {
                          purchase_price: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input input-xs w-16"
                      value={item.items_per_purchase ?? ''}
                      onChange={(e) =>
                        updateParsedIngredient(item._tempId, {
                          items_per_purchase: parseFloat(e.target.value) || 1,
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input input-xs w-16"
                      value={item.item_volume ?? ''}
                      onChange={(e) =>
                        updateParsedIngredient(item._tempId, {
                          item_volume: parseFloat(e.target.value) || null,
                        })
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="select select-xs w-20"
                      value={item.item_volume_unit || ''}
                      onChange={(e) =>
                        updateParsedIngredient(item._tempId, {
                          item_volume_unit: e.target.value || null,
                        })
                      }
                    >
                      <option value="">--</option>
                      {servingUnits.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="select select-xs w-20"
                      value={item.serving_unit || ''}
                      onChange={(e) =>
                        updateParsedIngredient(item._tempId, {
                          serving_unit: e.target.value || null,
                        })
                      }
                    >
                      <option value="">--</option>
                      {servingUnits.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={item.returnable || false}
                      onChange={(e) =>
                        updateParsedIngredient(item._tempId, {
                          returnable: e.target.checked,
                        })
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => removeParsedIngredient(item._tempId)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {parsedIngredients.length === 0 && (
            <p className="text-sm text-base-content/60 p-4 text-center">
              Aucun ingrédient détecté
            </p>
          )}
        </div>
      )}

      {/* Recipes tab */}
      {activeTab === 'recipes' && (
        <div className="space-y-3">
          {parsedRecipes.map((recipe) => (
            <div
              key={recipe._tempId}
              className="card bg-base-200 card-compact"
            >
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <input
                    className="input input-sm flex-1"
                    value={recipe.name || ''}
                    onChange={(e) =>
                      updateParsedRecipe(recipe._tempId, {
                        name: e.target.value,
                      })
                    }
                  />
                  <select
                    className="select select-sm w-40"
                    value={recipe.type || ''}
                    onChange={(e) =>
                      updateParsedRecipe(recipe._tempId, {
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Type --</option>
                    {recipeTypes.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="input input-sm w-24"
                    placeholder="Prix"
                    value={recipe.selling_price ?? ''}
                    onChange={(e) =>
                      updateParsedRecipe(recipe._tempId, {
                        selling_price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <button
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => removeParsedRecipe(recipe._tempId)}
                  >
                    ✕
                  </button>
                </div>
                {/* Ingredients list */}
                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <div className="mt-2">
                    <table className="table table-xs">
                      <thead>
                        <tr>
                          <th>Ingrédient</th>
                          <th>Quantité</th>
                          <th>Unité</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recipe.ingredients.map((ri, idx) => (
                          <tr key={idx}>
                            <td>
                              <select
                                className="select select-xs w-48"
                                value={ri.ingredient_name || ''}
                                onChange={(e) => {
                                  const updated = [...recipe.ingredients];
                                  updated[idx] = {
                                    ...updated[idx],
                                    ingredient_name: e.target.value,
                                  };
                                  updateParsedRecipe(recipe._tempId, {
                                    ingredients: updated,
                                  });
                                }}
                              >
                                <option value="">--</option>
                                {parsedIngredients.map((ing) => (
                                  <option key={ing._tempId} value={ing.name}>
                                    {ing.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                className="input input-xs w-20"
                                value={ri.quantity_used ?? ''}
                                onChange={(e) => {
                                  const updated = [...recipe.ingredients];
                                  updated[idx] = {
                                    ...updated[idx],
                                    quantity_used:
                                      parseFloat(e.target.value) || 1,
                                  };
                                  updateParsedRecipe(recipe._tempId, {
                                    ingredients: updated,
                                  });
                                }}
                              />
                            </td>
                            <td>
                              <select
                                className="select select-xs w-20"
                                value={ri.unit || ''}
                                onChange={(e) => {
                                  const updated = [...recipe.ingredients];
                                  updated[idx] = {
                                    ...updated[idx],
                                    unit: e.target.value,
                                  };
                                  updateParsedRecipe(recipe._tempId, {
                                    ingredients: updated,
                                  });
                                }}
                              >
                                <option value="">--</option>
                                {servingUnits.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
          {parsedRecipes.length === 0 && (
            <p className="text-sm text-base-content/60 text-center">
              Aucune recette détectée
            </p>
          )}
        </div>
      )}

      {/* Fixed costs tab */}
      {activeTab === 'fixed_costs' && (
        <div className="overflow-x-auto">
          <table className="table table-xs">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Montant (CHF)</th>
                <th>Catégorie</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {parsedFixedCosts.map((item) => (
                <tr key={item._tempId}>
                  <td>
                    <input
                      className="input input-xs w-64"
                      value={item.name || ''}
                      onChange={(e) =>
                        updateParsedFixedCost(item._tempId, {
                          name: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input input-xs w-24"
                      value={item.amount ?? ''}
                      onChange={(e) =>
                        updateParsedFixedCost(item._tempId, {
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="select select-xs w-36"
                      value={item.category || ''}
                      onChange={(e) =>
                        updateParsedFixedCost(item._tempId, {
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="">--</option>
                      {FIXED_COST_CATEGORIES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => removeParsedFixedCost(item._tempId)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {parsedFixedCosts.length === 0 && (
            <p className="text-sm text-base-content/60 p-4 text-center">
              Aucun coût fixe détecté
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="alert alert-error text-sm">{error}</div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-base-300">
        <button
          className="btn btn-ghost"
          onClick={() => setStep('upload')}
          disabled={loading}
        >
          Retour
        </button>
        <div className="flex-1" />
        <input
          className="input input-sm w-64"
          placeholder="Label de l'import (optionnel)"
          value={batchLabel}
          onChange={(e) => setBatchLabel(e.target.value)}
        />
        <button
          className="btn btn-primary"
          disabled={loading || totalItems === 0}
          onClick={handleImport}
        >
          {loading && <span className="loading loading-spinner loading-sm" />}
          Importer tout ({totalItems})
        </button>
      </div>
    </div>
  );
}
