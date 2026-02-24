import { useMemo } from 'react';
import { useRecipeStore } from '../stores/useRecipeStore';
import { useIngredientStore } from '../stores/useIngredientStore';
import { useProfileStore } from '../stores/useProfileStore';
import { useProjectionStore } from '../stores/useProjectionStore';
import { useFixedCostStore } from '../stores/useFixedCostStore';
import { useConfigStore } from '../stores/useConfigStore';
import {
  calcProductionCost,
  calcMargin,
  calcUnsoldCost,
  calcVolunteerEntitlements,
  calcMixedProfileImpact,
  calcNetResult,
} from '../lib/calculations';

export function useCalculations(scenario = 'realistic') {
  const recipes = useRecipeStore((s) => s.recipes);
  const ingredients = useIngredientStore((s) => s.ingredients);
  const profiles = useProfileStore((s) => s.profiles);
  const rights = useProfileStore((s) => s.rights);
  const payingConsumption = useProfileStore((s) => s.payingConsumption);
  const headcounts = useProjectionStore((s) => s.headcounts);
  const volunteerShifts = useProjectionStore((s) => s.volunteerShifts);
  const consumptionRates = useProjectionStore((s) => s.consumptionRates);
  const fixedCosts = useFixedCostStore((s) => s.fixedCosts);
  const config = useConfigStore((s) => s.config);

  return useMemo(() => {
    if (!config || !recipes.length) {
      return {
        recipeDetails: [],
        scenarioResult: null,
        totalFixedCosts: 0,
        alerts: [],
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

    // Headcounts par profil pour le scenario
    const headcountMap = {};
    headcounts.filter((h) => h.scenario === scenario).forEach((h) => { headcountMap[h.profile_id] = h.count || 0; });

    // Taux de consommation pour le scenario
    const ratesForScenario = consumptionRates.filter((cr) => cr.scenario === scenario);

    // Profil visiteur public
    const visitorProfile = profiles.find((p) => p.name === 'Visiteur public');
    const visitorCount = visitorProfile ? (headcountMap[visitorProfile.id] || 0) : 0;

    // Recettes visiteurs : somme des taux * prix * headcount
    const visitorRates = ratesForScenario.filter((cr) => visitorProfile && cr.profile_id === visitorProfile.id);
    const revenuesVisitors = visitorRates.reduce((total, cr) => {
      const price = recipePriceMap[cr.recipe_category] || 0;
      return total + (visitorCount * cr.rate_per_person * price);
    }, 0);

    // Profils mixtes : Pompiers
    const pompierProfile = profiles.find((p) => p.name === 'Pompier participant');
    const pompierCount = pompierProfile ? (headcountMap[pompierProfile.id] || 0) : 0;
    const pompierRights = pompierProfile ? rights.filter((r) => r.profile_id === pompierProfile.id) : [];
    const pompierPaying = pompierProfile ? payingConsumption.filter((pc) => pc.profile_id === pompierProfile.id && pc.scenario === scenario) : [];
    const pompierImpact = pompierProfile
      ? calcMixedProfileImpact(pompierProfile, pompierRights, pompierPaying, pompierCount, recipePriceMap, recipeProductionCostMap)
      : { offeredCharges: 0, payingRevenues: 0 };

    // Profils mixtes : Arbitres
    const arbitreProfile = profiles.find((p) => p.name === 'Arbitre');
    const arbitreCount = arbitreProfile ? (headcountMap[arbitreProfile.id] || 0) : 0;
    const arbitreRights = arbitreProfile ? rights.filter((r) => r.profile_id === arbitreProfile.id) : [];
    const arbitrePaying = arbitreProfile ? payingConsumption.filter((pc) => pc.profile_id === arbitreProfile.id && pc.scenario === scenario) : [];
    const arbitreImpact = arbitreProfile
      ? calcMixedProfileImpact(arbitreProfile, arbitreRights, arbitrePaying, arbitreCount, recipePriceMap, recipeProductionCostMap)
      : { offeredCharges: 0, payingRevenues: 0 };

    // Cout de production des portions vendues (simplifie : toutes les ventes visiteurs + pompiers payant + arbitres payant)
    const totalSoldRevenue = revenuesVisitors + pompierImpact.payingRevenues + arbitreImpact.payingRevenues;
    const avgMarginPct = recipeDetails.length
      ? recipeDetails.reduce((s, r) => s + (r.margin?.percentage || 0), 0) / recipeDetails.length / 100
      : 0;
    const productionCostsSold = totalSoldRevenue * (1 - avgMarginPct);

    // Invendus
    const unsoldCosts = recipeDetails.reduce((total, recipe) => {
      const ri = recipe.recipe_ingredients || [];
      const plannedQty = 50; // Estimation simplifiee, a affiner avec les projections
      return total + calcUnsoldCost(recipe, ri, ingredientMap, plannedQty);
    }, 0);

    // Resultat net
    const scenarioResult = calcNetResult({
      revenuesVisitors,
      revenuesPompiers: pompierImpact.payingRevenues,
      revenuesArbitres: arbitreImpact.payingRevenues,
      chargesOffertsPompiers: pompierImpact.offeredCharges,
      chargesOffertsArbitres: arbitreImpact.offeredCharges,
      chargesOffertsBenevoles: volunteerResult.totalCost,
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
        revenuesPompiers: pompierImpact.payingRevenues,
        revenuesArbitres: arbitreImpact.payingRevenues,
        chargesOffertsPompiers: pompierImpact.offeredCharges,
        chargesOffertsArbitres: arbitreImpact.offeredCharges,
        chargesOffertsBenevoles: volunteerResult.totalCost,
        productionCostsSold,
        fixedCosts: totalFixedCosts,
        unsoldCosts,
      },
      totalFixedCosts,
      alerts,
      volunteerResult,
      recipePriceMap,
      recipeProductionCostMap,
    };
  }, [recipes, ingredients, profiles, rights, payingConsumption, headcounts, volunteerShifts, consumptionRates, fixedCosts, config, scenario]);
}
