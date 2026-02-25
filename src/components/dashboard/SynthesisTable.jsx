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
      {[...allCats].map((cat) => {
        const rc = findCat(r, cat);
        const label = `${categoryLabels[cat] || cat} (${fmtN(rc?.rate || 0, 1)}/pers. × ${fmt(rc?.price)})`;
        return (
          <SubRow
            key={cat}
            label={label}
            pVal={findCat(p, cat)?.subtotal || 0}
            rVal={rc?.subtotal || 0}
            oVal={findCat(o, cat)?.subtotal || 0}
          />
        );
      })}
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

function CotisationDrinksDetail({ scenarios }) {
  const get = (s) => s.details?.cotisationCategories;
  const r = get(scenarios.realistic) || [];
  const p = get(scenarios.pessimistic) || [];
  const o = get(scenarios.optimistic) || [];
  if (!r.length) return null;

  return r.filter((c) => c.drinkCost > 0).map((cat, i) => {
    const label = `${cat.name} (${fmtN(cat.numTeams)} éq. × ${fmtN(cat.drinkQtyPerTeam)} ${cat.drinkRecipeName || 'boisson'} × ${fmt(cat.drinkCostPerUnit)})`;
    const pi = p.find((c) => c.name === cat.name);
    const oi = o.find((c) => c.name === cat.name);
    return (
      <SubRow key={i} label={label} pVal={pi?.drinkCost || 0} rVal={cat.drinkCost} oVal={oi?.drinkCost || 0} />
    );
  });
}

function CotisationMealsDetail({ scenarios }) {
  const get = (s) => s.details?.cotisationCategories;
  const r = get(scenarios.realistic) || [];
  const p = get(scenarios.pessimistic) || [];
  const o = get(scenarios.optimistic) || [];
  if (!r.length) return null;

  return r.filter((c) => c.mealCost > 0).map((cat, i) => {
    const label = `${cat.name} (${fmtN(cat.players)} pers. × ${fmtN(cat.mealsPerPlayer)} ${cat.mealRecipeName || 'repas'} × ${fmt(cat.mealCostPerUnit)})`;
    const pi = p.find((c) => c.name === cat.name);
    const oi = o.find((c) => c.name === cat.name);
    return (
      <SubRow key={i} label={label} pVal={pi?.mealCost || 0} rVal={cat.mealCost} oVal={oi?.mealCost || 0} />
    );
  });
}

function VolunteerDetail({ scenarios }) {
  const get = (s) => s.details?.volunteer;
  const p = get(scenarios.pessimistic);
  const r = get(scenarios.realistic);
  const o = get(scenarios.optimistic);
  if (!r) return null;

  return (
    <>
      <SubRow
        label={`Bénévoles (${fmtN(r.n1)}×1 + ${fmtN(r.n2)}×2 + ${fmtN(r.n3)}×3 shifts)`}
        pVal={p?.totalHours} rVal={r.totalHours} oVal={o?.totalHours}
        unit="h"
      />
      <SubRow
        label={`Repas dus (${fmtN(r.meals)} × ${fmt(r.avgMealCost)})`}
        pVal={(p?.meals || 0) * (p?.avgMealCost || 0)}
        rVal={r.meals * r.avgMealCost}
        oVal={(o?.meals || 0) * (o?.avgMealCost || 0)}
      />
      <SubRow
        label={`Boissons dues (${fmtN(r.drinks)} × ${fmt(r.avgDrinkCost)})`}
        pVal={(p?.drinks || 0) * (p?.avgDrinkCost || 0)}
        rVal={r.drinks * r.avgDrinkCost}
        oVal={(o?.drinks || 0) * (o?.avgDrinkCost || 0)}
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

function ProductionCostDetail({ scenarios }) {
  const get = (s) => s.details?.productionCost;
  const p = get(scenarios.pessimistic);
  const r = get(scenarios.realistic);
  const o = get(scenarios.optimistic);
  if (!r) return null;

  return (
    <>
      <SubRow
        label="Chiffre d'affaires total (ventes)"
        pVal={p?.totalSoldRevenue} rVal={r.totalSoldRevenue} oVal={o?.totalSoldRevenue}
      />
      <SubRow
        label={`Marge moyenne: ${fmtN(r.avgMarginPct, 1)}% → coût = CA × ${fmtN(100 - r.avgMarginPct, 1)}%`}
        pVal={p?.totalSoldRevenue * (1 - (p?.avgMarginPct || 0) / 100)}
        rVal={r.totalSoldRevenue * (1 - r.avgMarginPct / 100)}
        oVal={o?.totalSoldRevenue * (1 - (o?.avgMarginPct || 0) / 100)}
      />
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
              {expanded.prodCosts && <ProductionCostDetail scenarios={scenarios} />}

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
