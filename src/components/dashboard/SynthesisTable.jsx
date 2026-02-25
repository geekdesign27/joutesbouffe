import { useState, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTaxonomyStore } from '../../stores/useTaxonomyStore';

const fmt = (v) => {
  if (v == null) return 'CHF 0,00';
  return `CHF ${Number(v).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtN = (v, decimals = 0) => Number(v).toLocaleString('fr-CH', {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
});

function SubRow({ label, pVal, rVal, oVal, unit = 'chf' }) {
  const render = (v) => {
    if (unit === 'chf') return fmt(v);
    if (unit === '%') return `${fmtN(v, 1)} %`;
    if (unit === 'pers.') return `${fmtN(v)} pers.`;
    if (unit === 'h') return `${fmtN(v)} h`;
    return fmtN(v, 2);
  };
  return (
    <tr className="bg-base-200/30">
      <td className="text-xs pl-12 py-1 text-base-content/70">{label}</td>
      <td className="text-right font-mono text-xs py-1 text-base-content/70">{render(pVal)}</td>
      <td className="text-right font-mono text-xs py-1 text-base-content/70">{render(rVal)}</td>
      <td className="text-right font-mono text-xs py-1 text-base-content/70">{render(oVal)}</td>
    </tr>
  );
}

function CategoryDetailRow({ label, pCat, rCat, oCat }) {
  const formula = (c) => {
    if (!c || !c.rate) return fmt(0);
    return `${fmtN(c.rate, 1)} × ${fmt(c.price)} = ${fmt(c.subtotal)}`;
  };
  return (
    <tr className="bg-base-200/30">
      <td className="text-xs pl-12 py-1 text-base-content/70">{label}</td>
      <td className="text-right font-mono text-xs py-1 text-base-content/70">{formula(pCat)}</td>
      <td className="text-right font-mono text-xs py-1 text-base-content/70">{formula(rCat)}</td>
      <td className="text-right font-mono text-xs py-1 text-base-content/70">{formula(oCat)}</td>
    </tr>
  );
}

function ProfileRevenueDetail({ scenarios, detailKey, categoryLabels }) {
  const get = (s) => s.details?.[detailKey];
  const p = get(scenarios.pessimistic);
  const r = get(scenarios.realistic);
  const o = get(scenarios.optimistic);
  if (!r) return null;

  // Collect all categories across all scenarios
  const allCats = new Set();
  [p, r, o].forEach((d) => d?.categories?.forEach((c) => allCats.add(c.category)));

  const findCat = (d, cat) => d?.categories?.find((c) => c.category === cat);

  return (
    <>
      <SubRow
        label="Fréquentation"
        pVal={p?.headcount} rVal={r?.headcount} oVal={o?.headcount}
        unit="pers."
      />
      <SubRow
        label="Variation consommation"
        pVal={p?.variationPct} rVal={r?.variationPct} oVal={o?.variationPct}
        unit="%"
      />
      {[...allCats].map((cat) => (
        <CategoryDetailRow
          key={cat}
          label={`${categoryLabels[cat] || cat} (/pers.×prix)`}
          pCat={findCat(p, cat)}
          rCat={findCat(r, cat)}
          oCat={findCat(o, cat)}
        />
      ))}
    </>
  );
}

function CotisationRevenueDetail({ scenarios }) {
  const get = (s) => s.details?.cotisationCategories;
  const p = get(scenarios.pessimistic) || [];
  const r = get(scenarios.realistic) || [];
  const o = get(scenarios.optimistic) || [];
  if (!r.length) return null;

  return r.map((cat, i) => {
    const label = `${cat.name} (${fmtN(cat.players)} joueurs × ${fmt(cat.feePerPlayer)})`;
    return (
      <SubRow key={i} label={label} pVal={p[i]?.revenue || 0} rVal={cat.revenue} oVal={o[i]?.revenue || 0} />
    );
  });
}

function FormulaRow({ label, pFormula, rFormula, oFormula }) {
  return (
    <tr className="bg-base-200/30">
      <td className="text-xs pl-12 py-1 text-base-content/70">{label}</td>
      <td className="text-right font-mono text-xs py-1 text-base-content/70">{pFormula}</td>
      <td className="text-right font-mono text-xs py-1 text-base-content/70">{rFormula}</td>
      <td className="text-right font-mono text-xs py-1 text-base-content/70">{oFormula}</td>
    </tr>
  );
}

function CotisationDrinksDetail({ scenarios }) {
  const get = (s) => s.details?.cotisationCategories;
  const r = get(scenarios.realistic) || [];
  const p = get(scenarios.pessimistic) || [];
  const o = get(scenarios.optimistic) || [];
  if (!r.length) return null;

  const formula = (cat) => {
    if (!cat || !cat.drinkCost) return fmt(0);
    return `${fmtN(cat.numTeams)} éq. × ${fmtN(cat.drinkQtyPerTeam)} × ${fmt(cat.drinkCostPerUnit)} = ${fmt(cat.drinkCost)}`;
  };

  return r.filter((c) => c.drinkCost > 0).map((cat, i) => {
    const pi = p.find((c) => c.name === cat.name);
    const oi = o.find((c) => c.name === cat.name);
    return (
      <FormulaRow
        key={i}
        label={`${cat.name} (${cat.drinkRecipeName || 'boisson'})`}
        pFormula={formula(pi)} rFormula={formula(cat)} oFormula={formula(oi)}
      />
    );
  });
}

function CotisationMealsDetail({ scenarios }) {
  const get = (s) => s.details?.cotisationCategories;
  const r = get(scenarios.realistic) || [];
  const p = get(scenarios.pessimistic) || [];
  const o = get(scenarios.optimistic) || [];
  if (!r.length) return null;

  const formula = (cat) => {
    if (!cat || !cat.mealCost) return fmt(0);
    return `${fmtN(cat.players)} × ${fmtN(cat.mealsPerPlayer)} × ${fmt(cat.mealCostPerUnit)} = ${fmt(cat.mealCost)}`;
  };

  return r.filter((c) => c.mealCost > 0).map((cat, i) => {
    const pi = p.find((c) => c.name === cat.name);
    const oi = o.find((c) => c.name === cat.name);
    return (
      <FormulaRow
        key={i}
        label={`${cat.name} (${cat.mealRecipeName || 'repas'})`}
        pFormula={formula(pi)} rFormula={formula(cat)} oFormula={formula(oi)}
      />
    );
  });
}

function VolunteerDetail({ scenarios }) {
  const get = (s) => s.details?.volunteer;
  const p = get(scenarios.pessimistic);
  const r = get(scenarios.realistic);
  const o = get(scenarios.optimistic);
  if (!r) return null;

  const drinkFormula = (v) => {
    if (!v) return fmt(0);
    return `(${fmtN(v.n1)}×1 + ${fmtN(v.n2)}×2 + ${fmtN(v.n3)}×3) = ${fmtN(v.drinks)} × ${fmt(v.avgDrinkCost)} = ${fmt(v.drinks * v.avgDrinkCost)}`;
  };

  const mealFormula = (v) => {
    if (!v) return fmt(0);
    return `(${fmtN(v.n2)} + ${fmtN(v.n3)}) = ${fmtN(v.meals)} × ${fmt(v.avgMealCost)} = ${fmt(v.meals * v.avgMealCost)}`;
  };

  return (
    <>
      <FormulaRow
        label="Boissons (1/shift/pers.)"
        pFormula={drinkFormula(p)} rFormula={drinkFormula(r)} oFormula={drinkFormula(o)}
      />
      <FormulaRow
        label="Repas (1/pers. si 2+ shifts)"
        pFormula={mealFormula(p)} rFormula={mealFormula(r)} oFormula={mealFormula(o)}
      />
    </>
  );
}

function FixedCostsDetail({ scenarios }) {
  const get = (s) => s.details?.fixedCostsList;
  const list = get(scenarios.realistic) || [];
  if (!list.length) return null;

  return list.map((fc, i) => (
    <SubRow key={i} label={fc.name} pVal={fc.amount} rVal={fc.amount} oVal={fc.amount} />
  ));
}

function ProductionCostDetail({ scenarios, categoryLabels }) {
  const get = (s) => s.details?.productionCost;
  const p = get(scenarios.pessimistic);
  const r = get(scenarios.realistic);
  const o = get(scenarios.optimistic);
  if (!r) return null;

  // Collect all categories across all profiles and scenarios
  const allCats = new Set();
  [p, r, o].forEach((d) => {
    d?.perProfile?.forEach((prof) => {
      prof.categories?.forEach((c) => allCats.add(c.category));
    });
  });

  // Sum production cost per category across all profiles for a given scenario
  const catCost = (d, cat) => {
    if (!d?.perProfile) return 0;
    return d.perProfile.reduce((s, prof) => {
      const c = prof.categories?.find((x) => x.category === cat);
      return s + (c?.productionCost || 0);
    }, 0);
  };

  // Sum qty per category across all profiles for a given scenario
  const catQty = (d, cat) => {
    if (!d?.perProfile) return 0;
    return d.perProfile.reduce((s, prof) => {
      const c = prof.categories?.find((x) => x.category === cat);
      if (!c || !c.unitCost) return s;
      return s + (c.productionCost / c.unitCost);
    }, 0);
  };

  // Unit cost for a category (same across scenarios, based on recipe ingredients)
  const catUnitCost = (d, cat) => {
    if (!d?.perProfile) return 0;
    for (const prof of d.perProfile) {
      const c = prof.categories?.find((x) => x.category === cat);
      if (c?.unitCost) return c.unitCost;
    }
    return 0;
  };

  const formula = (d, cat) => {
    const qty = catQty(d, cat);
    const unit = catUnitCost(d, cat);
    const total = catCost(d, cat);
    if (!qty) return fmt(0);
    return `${fmtN(qty, 1)} × ${fmt(unit)} = ${fmt(total)}`;
  };

  return (
    <>
      {[...allCats].map((cat) => (
        <tr key={cat} className="bg-base-200/30">
          <td className="text-xs pl-12 py-1 text-base-content/70">
            {categoryLabels[cat] || cat} (portions × coût/u)
          </td>
          <td className="text-right font-mono text-xs py-1 text-base-content/70">{formula(p, cat)}</td>
          <td className="text-right font-mono text-xs py-1 text-base-content/70">{formula(r, cat)}</td>
          <td className="text-right font-mono text-xs py-1 text-base-content/70">{formula(o, cat)}</td>
        </tr>
      ))}
    </>
  );
}

function UnsoldDetail({ scenarios }) {
  const get = (s) => s.details?.unsoldDetails;
  const p = get(scenarios.pessimistic) || [];
  const r = get(scenarios.realistic) || [];
  const o = get(scenarios.optimistic) || [];
  if (!r.length) return null;

  return r.map((item, i) => {
    const label = `${item.name} (${fmtN(item.unsoldRate, 0)}% de ${item.plannedQty} = ${fmtN(item.unsoldQty, 1)} portions)`;
    return (
      <SubRow
        key={i} label={label}
        pVal={p[i]?.cost || 0} rVal={item.cost} oVal={o[i]?.cost || 0}
      />
    );
  });
}

export function SynthesisTable({ scenarios }) {
  const { pessimistic, realistic, optimistic } = scenarios;
  const [expanded, setExpanded] = useState({});
  const taxonomyItems = useTaxonomyStore((s) => s.items.recipe_type);
  const categoryLabels = useMemo(() => {
    const map = {};
    (taxonomyItems || []).forEach((item) => { map[item.value] = item.label; });
    return map;
  }, [taxonomyItems]);

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const mainRow = (key, label, getValue, { bold = false, result = false, expandable = false } = {}) => {
    const pVal = getValue(pessimistic);
    const rVal = getValue(realistic);
    const oVal = getValue(optimistic);
    const isOpen = expanded[key];
    const cls = bold ? 'font-bold' : '';
    const resultCls = (v) => result ? (v >= 0 ? 'text-success' : 'text-error') : '';

    return (
      <tr
        key={key}
        className={`${bold ? 'bg-base-200' : ''} ${expandable ? 'cursor-pointer hover:bg-base-200/50' : ''}`}
        onClick={expandable ? () => toggle(key) : undefined}
      >
        <td className={`${cls} ${bold ? 'text-sm' : 'text-sm pl-8'}`}>
          {expandable && (
            <ChevronRight
              size={14}
              className={`inline mr-1 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            />
          )}
          {label}
        </td>
        <td className={`text-right font-mono ${cls} ${resultCls(pVal)}`}>{fmt(pVal)}</td>
        <td className={`text-right font-mono ${cls} ${resultCls(rVal)}`}>{fmt(rVal)}</td>
        <td className={`text-right font-mono ${cls} ${resultCls(oVal)}`}>{fmt(oVal)}</td>
      </tr>
    );
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Poste</th>
                <th className="text-right">Pessimiste</th>
                <th className="text-right">Réaliste</th>
                <th className="text-right">Optimiste</th>
              </tr>
            </thead>
            <tbody>
              {/* RECETTES */}
              <tr><td colSpan="4" className="font-bold text-primary pt-4">RECETTES</td></tr>

              {mainRow('visitors', 'Ventes visiteurs publics', (s) => s.scenarioResult?.revenuesVisitors, { expandable: true })}
              {expanded.visitors && <ProfileRevenueDetail scenarios={scenarios} detailKey="visitorRevenue" categoryLabels={categoryLabels} />}

              {mainRow('pompiers', 'Ventes pompiers (part payante)', (s) => s.scenarioResult?.revenuesPompiers, { expandable: true })}
              {expanded.pompiers && <ProfileRevenueDetail scenarios={scenarios} detailKey="pompierRevenue" categoryLabels={categoryLabels} />}

              {mainRow('arbitres', 'Ventes arbitres (part payante)', (s) => s.scenarioResult?.revenuesArbitres, { expandable: true })}
              {expanded.arbitres && <ProfileRevenueDetail scenarios={scenarios} detailKey="arbitreRevenue" categoryLabels={categoryLabels} />}

              {mainRow('cotisations', 'Cotisations équipes', (s) => s.scenarioResult?.revenuesCotisations, { expandable: true })}
              {expanded.cotisations && <CotisationRevenueDetail scenarios={scenarios} />}

              {mainRow('totalRevenues', 'TOTAL RECETTES', (s) => s.scenarioResult?.totalRevenues, { bold: true })}

              {/* CHARGES */}
              <tr><td colSpan="4" className="font-bold text-primary pt-4">CHARGES</td></tr>

              {mainRow('benevoles', 'Charges offertes bénévoles', (s) => s.scenarioResult?.chargesOffertsBenevoles, { expandable: true })}
              {expanded.benevoles && <VolunteerDetail scenarios={scenarios} />}

              {mainRow('cotDrinks', 'Boissons offertes (équipes)', (s) => s.scenarioResult?.chargesCotisationsDrinks, { expandable: true })}
              {expanded.cotDrinks && <CotisationDrinksDetail scenarios={scenarios} />}

              {mainRow('cotMeals', 'Repas offerts (équipes)', (s) => s.scenarioResult?.chargesCotisationsMeals, { expandable: true })}
              {expanded.cotMeals && <CotisationMealsDetail scenarios={scenarios} />}

              {mainRow('prodCosts', 'Coûts de production (vendus)', (s) => s.scenarioResult?.productionCostsSold, { expandable: true })}
              {expanded.prodCosts && <ProductionCostDetail scenarios={scenarios} categoryLabels={categoryLabels} />}

              {mainRow('fixedCosts', 'Coûts fixes', (s) => s.scenarioResult?.fixedCosts, { expandable: true })}
              {expanded.fixedCosts && <FixedCostsDetail scenarios={scenarios} />}

              {mainRow('unsold', 'Coûts invendus non récupérables', (s) => s.scenarioResult?.unsoldCosts, { expandable: true })}
              {expanded.unsold && <UnsoldDetail scenarios={scenarios} />}

              {mainRow('totalCharges', 'TOTAL CHARGES', (s) => s.scenarioResult?.totalCharges, { bold: true })}

              {/* RESULTAT */}
              <tr><td colSpan="4" className="pt-2" /></tr>
              {mainRow('netResult', 'RÉSULTAT NET', (s) => s.scenarioResult?.netResult, { bold: true, result: true })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
