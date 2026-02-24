import { useIngredientStore } from '../../stores/useIngredientStore';
import { calcProductionCost, calcMargin, calcLineItemCost } from '../../lib/calculations';
import { MarginBadge } from '../shared/MarginBadge';

export function RecipeCostPanel({ recipe }) {
  const ingredients = useIngredientStore((s) => s.ingredients);
  const ingredientMap = {};
  ingredients.forEach((ing) => { ingredientMap[ing.id] = ing; });

  const ri = recipe?.recipe_ingredients || [];
  // Fallback: utiliser les données imbriquées Supabase (ri.ingredient) si le store n'a pas l'ingrédient
  ri.forEach((item) => {
    if (item.ingredient && !ingredientMap[item.ingredient_id]) {
      ingredientMap[item.ingredient_id] = item.ingredient;
    }
  });

  const productionCost = calcProductionCost(ri, ingredientMap);
  const margin = calcMargin(recipe?.selling_price, productionCost);

  return (
    <div className="border border-base-300 rounded-lg p-4">
      <h4 className="font-semibold mb-3">Analyse des coûts</h4>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm">Coût de production</span>
          <span className="font-mono font-semibold">{productionCost.toFixed(2)} CHF</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Prix de vente</span>
          <span className="font-mono">{Number(recipe?.selling_price || 0).toFixed(2)} CHF</span>
        </div>
        <div className="divider my-1" />
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Marge brute</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold">{margin.absolute.toFixed(2)} CHF</span>
            <MarginBadge margin={margin} />
          </div>
        </div>

        {ri.length > 0 && (
          <>
            <div className="divider my-1" />
            <h5 className="text-xs font-semibold text-base-content/60 uppercase">Détail par ingrédient</h5>
            <div className="overflow-x-auto">
              <table className="table table-xs">
                <thead>
                  <tr>
                    <th>Ingrédient</th>
                    <th className="text-right">Qté</th>
                    <th className="text-right">Prix/u</th>
                    <th className="text-right">Perte</th>
                    <th className="text-right">Coût</th>
                  </tr>
                </thead>
                <tbody>
                  {ri.map((item) => {
                    const ing = ingredientMap[item.ingredient_id];
                    if (!ing) return null;
                    const lineInfo = calcLineItemCost(item, ing);
                    const key = item.id || item._localId;
                    return (
                      <tr key={key}>
                        <td>{ing.name}</td>
                        <td className="text-right font-mono">{item.quantity_used} {lineInfo.unit}</td>
                        <td className="text-right font-mono">{lineInfo.servingUnitPrice.toFixed(4)}</td>
                        <td className="text-right font-mono">{ing.waste_rate}%</td>
                        <td className="text-right font-mono">{lineInfo.lineCost.toFixed(2)} CHF</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
