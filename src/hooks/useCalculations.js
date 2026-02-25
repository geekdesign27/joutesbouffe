import { useMemo } from 'react';
import { useRecipeStore } from '../stores/useRecipeStore';
import { useIngredientStore } from '../stores/useIngredientStore';
import { useProfileStore } from '../stores/useProfileStore';
import { useProjectionStore } from '../stores/useProjectionStore';
import { useFixedCostStore } from '../stores/useFixedCostStore';
import { useConfigStore } from '../stores/useConfigStore';
import { useTeamCategoryStore } from '../stores/useTeamCategoryStore';
import {
  calcProductionCost,
  calcMargin,
  calcUnsoldCost,
  calcVolunteerEntitlements,
  calcCotisationResult,
  calcNetResult,
} from '../lib/calculations';

export function useCalculations(scenario = 'realistic') {
  const recipes = useRecipeStore((s) => s.recipes);
  const ingredients = useIngredientStore((s) => s.ingredients);
  const profiles = useProfileStore((s) => s.profiles);
  const headcounts = useProjectionStore((s) => s.headcounts);
  const volunteerShifts = useProjectionStore((s) => s.volunteerShifts);
  const consumptionRates = useProjectionStore((s) => s.consumptionRates);
  const fixedCosts = useFixedCostStore((s) => s.fixedCosts);
  const config = useConfigStore((s) => s.config);
  const teamCategories = useTeamCategoryStore((s) => s.teamCategories);

  return useMemo(() => {
    if (!config || !recipes.length) {
      return {
        recipeDetails: [],
        scenarioResult: null,
        totalFixedCosts: 0,
        alerts: [],
        details: {},
      };
    }

    // Carte des ingredients par ID
    const ingredientMap = {};
    ingredients.forEach((ing) => { ingredientMap[ing.id] = ing; });

    // Calculs par recette : cout de production, marge
    const recipeDetails = recipes.map((recipe) => {
      const ri = recipe.recipe_ingredients || [];
      const productionCost = calcProductionCost(ri, ingredientMap);
      const margin = calcMargin(recipe.selling_price, productionCost);
      return { ...recipe, productionCost, margin };
    });

    // Prix moyen et cout moyen par categorie de recette
    const recipePriceMap = {};
    const recipeProductionCostMap = {};
    const categoryGroups = {};
    recipeDetails.forEach((r) => {
      if (!r.type) return;
      if (!categoryGroups[r.type]) categoryGroups[r.type] = [];
      categoryGroups[r.type].push(r);
    });
    Object.entries(categoryGroups).forEach(([cat, items]) => {
      recipePriceMap[cat] = items.reduce((s, r) => s + Number(r.selling_price || 0), 0) / items.length;
      recipeProductionCostMap[cat] = items.reduce((s, r) => s + r.productionCost, 0) / items.length;
    });

    // Total couts fixes
    const totalFixedCosts = fixedCosts.reduce((s, fc) => s + Number(fc.amount || 0), 0);

    // Shifts benevoles pour le scenario
    const scenarioShifts = volunteerShifts.find((vs) => vs.scenario === scenario) || {
      volunteers_1_shift: 0, volunteers_2_shifts: 0, volunteers_3_shifts: 0, consumption_variation_pct: 0,
    };

    // Cout moyen repas et boisson
    const avgMealCost = recipeProductionCostMap['repas'] || 0;
    const avgDrinkCost = recipeProductionCostMap['boisson_froide'] || 0;

    const volunteerResult = calcVolunteerEntitlements(scenarioShifts, config, avgMealCost, avgDrinkCost);

    // Headcounts par profil pour le scenario (avec variation_pct)
    const headcountMap = {};
    headcounts.filter((h) => h.scenario === scenario).forEach((h) => {
      headcountMap[h.profile_id] = { count: h.count || 0, variationPct: h.variation_pct || 0 };
    });

    // Taux de consommation pour le scenario
    const ratesForScenario = consumptionRates.filter((cr) => cr.scenario === scenario);

    // Detail des revenus par profil et par categorie
    const calcProfileRevenueDetails = (profileId) => {
      const data = headcountMap[profileId] || { count: 0, variationPct: 0 };
      const factor = 1 + (data.variationPct / 100);
      const rates = ratesForScenario.filter((cr) => cr.profile_id === profileId);
      const qty = (cr) => data.count * cr.rate_per_person * factor;
      const categories = rates.map((cr) => ({
        category: cr.recipe_category,
        rate: cr.rate_per_person,
        price: recipePriceMap[cr.recipe_category] || 0,
        unitCost: recipeProductionCostMap[cr.recipe_category] || 0,
        subtotal: qty(cr) * (recipePriceMap[cr.recipe_category] || 0),
        productionCost: qty(cr) * (recipeProductionCostMap[cr.recipe_category] || 0),
      })).filter((c) => c.rate > 0);
      return {
        headcount: data.count,
        variationPct: data.variationPct,
        categories,
        total: categories.reduce((s, c) => s + c.subtotal, 0),
        totalProductionCost: categories.reduce((s, c) => s + c.productionCost, 0),
      };
    };

    const visitorProfile = profiles.find((p) => p.name === 'Visiteur public');
    const visitorDetail = visitorProfile
      ? calcProfileRevenueDetails(visitorProfile.id)
      : { headcount: 0, variationPct: 0, categories: [], total: 0 };
    const revenuesVisitors = visitorDetail.total;

    const pompierProfile = profiles.find((p) => p.name === 'Pompier participant');
    const pompierDetail = pompierProfile
      ? calcProfileRevenueDetails(pompierProfile.id)
      : { headcount: 0, variationPct: 0, categories: [], total: 0 };
    const revenuesPompiers = pompierDetail.total;

    const arbitreProfile = profiles.find((p) => p.name === 'Arbitre');
    const arbitreDetail = arbitreProfile
      ? calcProfileRevenueDetails(arbitreProfile.id)
      : { headcount: 0, variationPct: 0, categories: [], total: 0 };
    const revenuesArbitres = arbitreDetail.total;

    // Cout de production des portions vendues (somme par categorie, pas par marge moyenne)
    const totalSoldRevenue = revenuesVisitors + revenuesPompiers + revenuesArbitres;
    const productionCostsSold = visitorDetail.totalProductionCost
      + pompierDetail.totalProductionCost
      + arbitreDetail.totalProductionCost;

    // Invendus (detail par recette)
    const unsoldDetails = recipeDetails.map((recipe) => {
      const ri = recipe.recipe_ingredients || [];
      const plannedQty = 50;
      const cost = calcUnsoldCost(recipe, ri, ingredientMap, plannedQty);
      const unsoldQty = plannedQty * ((recipe.unsold_rate_estimate || 0) / 100);
      return { name: recipe.name, unsoldRate: recipe.unsold_rate_estimate || 0, plannedQty, unsoldQty, cost };
    }).filter((d) => d.cost > 0);
    const unsoldCosts = unsoldDetails.reduce((s, d) => s + d.cost, 0);

    // Cotisations equipes (detail par categorie)
    const recipeCostMap = {};
    recipeDetails.forEach((r) => { recipeCostMap[r.id] = r.productionCost; });
    const cotisationResult = calcCotisationResult(teamCategories, recipeCostMap);

    const cotisationDetails = teamCategories.map((cat) => {
      const players = (cat.num_teams || 0) * (cat.players_per_team || 0);
      const revenue = players * (cat.fee_per_player || 0);
      const drinkRecipe = recipeDetails.find((r) => r.id === cat.drink_recipe_id);
      const drinkCostPerUnit = (cat.drink_recipe_id && recipeCostMap[cat.drink_recipe_id] != null)
        ? recipeCostMap[cat.drink_recipe_id] : 0;
      const drinkCost = (cat.num_teams || 0) * (cat.drink_qty_per_team || 0) * drinkCostPerUnit;
      const mealRecipe = recipeDetails.find((r) => r.id === cat.meal_recipe_id);
      const mealCostPerUnit = (cat.meal_recipe_id && recipeCostMap[cat.meal_recipe_id] != null)
        ? recipeCostMap[cat.meal_recipe_id] : 0;
      const mealCost = players * (cat.meals_per_player || 0) * mealCostPerUnit;
      return {
        name: cat.name, numTeams: cat.num_teams || 0, playersPerTeam: cat.players_per_team || 0,
        players, feePerPlayer: cat.fee_per_player || 0, revenue,
        drinkRecipeName: drinkRecipe?.name, drinkQtyPerTeam: cat.drink_qty_per_team || 0, drinkCostPerUnit, drinkCost,
        mealRecipeName: mealRecipe?.name, mealsPerPlayer: cat.meals_per_player || 0, mealCostPerUnit, mealCost,
      };
    });

    // Resultat net
    const scenarioResult = calcNetResult({
      revenuesVisitors,
      revenuesPompiers,
      revenuesArbitres,
      revenuesCotisations: cotisationResult.totalRevenue,
      chargesOffertsPompiers: 0,
      chargesOffertsArbitres: 0,
      chargesOffertsBenevoles: volunteerResult.totalCost,
      chargesCotisationsOffertes: cotisationResult.totalOfferedCost,
      productionCostsSold,
      fixedCosts: totalFixedCosts,
      unsoldCosts,
    });

    // Alertes
    const alerts = [];
    if (scenarioResult.netResult < 0) {
      alerts.push({ type: 'error', message: `Resultat net negatif : CHF ${scenarioResult.netResult.toFixed(2)}` });
    }
    recipeDetails.forEach((r) => {
      if (r.selling_price > 0 && r.selling_price < r.productionCost) {
        alerts.push({ type: 'error', message: `${r.name} : prix de vente sous le cout de production` });
      }
      if (r.margin && r.margin.status === 'low' && r.selling_price > 0) {
        alerts.push({ type: 'warning', message: `${r.name} : marge faible (${r.margin.percentage.toFixed(1)}%)` });
      }
    });
    ingredients.forEach((ing) => {
      if (ing.perishable && !ing.returnable && ing.waste_rate > 20) {
        alerts.push({ type: 'warning', message: `${ing.name} : perissable, non retournable, taux de perte eleve (${ing.waste_rate}%)` });
      }
    });

    return {
      recipeDetails,
      scenarioResult: {
        ...scenarioResult,
        revenuesVisitors,
        revenuesPompiers,
        revenuesArbitres,
        revenuesCotisations: cotisationResult.totalRevenue,
        chargesOffertsBenevoles: volunteerResult.totalCost,
        chargesCotisationsDrinks: cotisationResult.totalDrinkCost,
        chargesCotisationsMeals: cotisationResult.totalMealCost,
        chargesCotisationsOffertes: cotisationResult.totalOfferedCost,
        productionCostsSold,
        fixedCosts: totalFixedCosts,
        unsoldCosts,
      },
      details: {
        visitorRevenue: visitorDetail,
        pompierRevenue: pompierDetail,
        arbitreRevenue: arbitreDetail,
        cotisationCategories: cotisationDetails,
        volunteer: {
          ...volunteerResult,
          avgMealCost,
          avgDrinkCost,
          n1: scenarioShifts.volunteers_1_shift || 0,
          n2: scenarioShifts.volunteers_2_shifts || 0,
          n3: scenarioShifts.volunteers_3_shifts || 0,
          variPct: scenarioShifts.consumption_variation_pct || 0,
        },
        fixedCostsList: fixedCosts.map((fc) => ({ name: fc.name, category: fc.category, amount: Number(fc.amount || 0) })),
        productionCost: {
          totalSoldRevenue,
          perProfile: [
            { label: 'Visiteurs', revenue: revenuesVisitors, cost: visitorDetail.totalProductionCost, categories: visitorDetail.categories },
            { label: 'Pompiers', revenue: revenuesPompiers, cost: pompierDetail.totalProductionCost, categories: pompierDetail.categories },
            { label: 'Arbitres', revenue: revenuesArbitres, cost: arbitreDetail.totalProductionCost, categories: arbitreDetail.categories },
          ],
        },
        unsoldDetails,
      },
      cotisationResult,
      totalFixedCosts,
      alerts,
      volunteerResult,
      recipePriceMap,
      recipeProductionCostMap,
    };
  }, [recipes, ingredients, profiles, headcounts, volunteerShifts, consumptionRates, fixedCosts, config, teamCategories, scenario]);
}
