// Tables de conversion entre unites compatibles
// Chaque unite est exprimee en unite de base (ml pour volume, g pour poids, 1 pour piece)
const UNIT_BASE = {
  L: 1000, dl: 100, cl: 10, ml: 1,
  kg: 1000, g: 1,
  pce: 1,
};

// Facteur de conversion entre 2 unites compatibles
// Ex: getConversionFactor('L', 'cl') = 100 (1L = 100cl)
// Retourne null si les unites sont incompatibles
export function getConversionFactor(fromUnit, toUnit) {
  const from = UNIT_BASE[fromUnit];
  const to = UNIT_BASE[toUnit];
  if (from == null || to == null) return null;
  // Verifier compatibilite (meme famille: volume, poids ou piece)
  const volumeUnits = ['L', 'dl', 'cl', 'ml'];
  const weightUnits = ['kg', 'g'];
  const pieceUnits = ['pce'];
  const families = [volumeUnits, weightUnits, pieceUnits];
  const fromFamily = families.find((f) => f.includes(fromUnit));
  const toFamily = families.find((f) => f.includes(toUnit));
  if (!fromFamily || !toFamily || fromFamily !== toFamily) return null;
  return from / to;
}

// Prix par unite de service (serving_unit) d'un ingredient
// Chaine 3 niveaux: unit_price / items_per_purchase / serving_quantity
export function calcServingUnitPrice(ingredient) {
  const itemsPerPurchase = ingredient.items_per_purchase || 1;
  const itemPrice = ingredient.unit_price / itemsPerPurchase;
  if (ingredient.serving_unit && ingredient.serving_quantity > 0) {
    return itemPrice / ingredient.serving_quantity;
  }
  return itemPrice;
}

// Cout d'une ligne de composition (recipe_ingredient + ingredient)
export function calcLineItemCost(ri, ingredient) {
  const servingUnitPrice = calcServingUnitPrice(ingredient);
  const wasteFactor = 1 + (ingredient.waste_rate / 100);
  const lineCost = ri.quantity_used * servingUnitPrice * wasteFactor;
  return {
    servingUnitPrice,
    wasteFactor,
    lineCost,
    unit: ri.unit || ingredient.serving_unit || ingredient.purchase_unit,
  };
}

// Cout de production d'une portion de recette, integrant le taux de perte par ingredient
export function calcProductionCost(recipeIngredients, ingredientMap) {
  return recipeIngredients.reduce((total, ri) => {
    const ing = ingredientMap[ri.ingredient_id];
    if (!ing) return total;
    const { lineCost } = calcLineItemCost(ri, ing);
    return total + lineCost;
  }, 0);
}

// Marge brute et taux de marge
export function calcMargin(sellingPrice, productionCost) {
  if (!sellingPrice || sellingPrice === 0) {
    return { absolute: 0, percentage: 0, status: 'not_sellable' };
  }
  const absolute = sellingPrice - productionCost;
  const percentage = (absolute / sellingPrice) * 100;
  const status = percentage < 20 ? 'low' : percentage < 40 ? 'medium' : 'good';
  return { absolute, percentage, status };
}

// Couleur DaisyUI par statut de marge
export function marginStatusColor(status) {
  return {
    low: 'badge-error',
    medium: 'badge-warning',
    good: 'badge-success',
    not_sellable: 'badge-ghost',
  }[status] ?? 'badge-ghost';
}

// Cout des invendus non recuperables (seuls les ingredients non retournables et perissables sont perdus)
export function calcUnsoldCost(recipe, recipeIngredients, ingredientMap, plannedQty) {
  const unsoldQty = plannedQty * (recipe.unsold_rate_estimate / 100);
  const lostCostPerUnit = recipeIngredients.reduce((total, ri) => {
    const ing = ingredientMap[ri.ingredient_id];
    if (!ing || ing.returnable) return total;
    const { lineCost } = calcLineItemCost(ri, ing);
    return total + lineCost;
  }, 0);
  return unsoldQty * lostCostPerUnit;
}

// Droits et couts benevoles
export function calcVolunteerEntitlements(shifts, eventConfig, avgMealCost, avgDrinkCost) {
  const {
    shift_duration_hours: shiftH,
    service_interval_hours: serviceH,
  } = eventConfig;
  const {
    volunteers_1_shift: n1,
    volunteers_2_shifts: n2,
    volunteers_3_shifts: n3,
    consumption_variation_pct: variPct,
  } = shifts;

  const totalHours = (n1 * shiftH) + (n2 * shiftH * 2) + (n3 * shiftH * 3);
  const variationFactor = 1 + (variPct / 100);

  const mealsRaw = Math.floor(totalHours / shiftH);
  const drinksRaw = Math.floor(totalHours / serviceH);

  const meals = Math.round(mealsRaw * variationFactor);
  const drinks = Math.round(drinksRaw * variationFactor);

  return {
    totalHours,
    meals,
    drinks,
    totalCost: (meals * avgMealCost) + (drinks * avgDrinkCost),
  };
}

// Revenus et charges pour un profil mixte (pompiers ou arbitres)
export function calcMixedProfileImpact(
  profile,
  rights,
  payingConsumption,
  headcount,
  recipePriceMap,
  recipeProductionCostMap
) {
  // Charges : ce que l'organisation offre
  const offeredCharges = rights.reduce((total, right) => {
    const costPerUnit = recipeProductionCostMap[right.recipe_category] ?? 0;
    return total + (headcount * right.quantity_per_right * costPerUnit);
  }, 0);

  // Recettes : ce que ce profil paie en supplement
  const payingRevenues = payingConsumption.reduce((total, pc) => {
    const price = recipePriceMap[pc.recipe_category] ?? 0;
    return total + (headcount * pc.rate_per_person * price);
  }, 0);

  return {
    offeredCharges,
    payingRevenues,
    netImpact: offeredCharges - payingRevenues,
  };
}

// Resultat net global pour un scenario
export function calcNetResult({
  revenuesVisitors,
  revenuesPompiers,
  revenuesArbitres,
  chargesOffertsPompiers,
  chargesOffertsArbitres,
  chargesOffertsBenevoles,
  productionCostsSold,
  fixedCosts,
  unsoldCosts,
}) {
  const totalRevenues =
    revenuesVisitors + revenuesPompiers + revenuesArbitres;

  const totalOfferedCharges =
    chargesOffertsPompiers + chargesOffertsArbitres + chargesOffertsBenevoles;

  const totalCharges =
    productionCostsSold + fixedCosts + totalOfferedCharges + unsoldCosts;

  return {
    totalRevenues,
    totalOfferedCharges,
    totalCharges,
    netResult: totalRevenues - totalCharges,
    isProfit: totalRevenues > totalCharges,
  };
}
