const fmt = (v) => {
  if (v == null) return 'CHF 0.00';
  return `CHF ${Number(v).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function SynthesisTable({ scenarios }) {
  const { pessimistic, realistic, optimistic } = scenarios;

  const row = (label, getValue, isBold = false, isResult = false) => {
    const pVal = getValue(pessimistic);
    const rVal = getValue(realistic);
    const oVal = getValue(optimistic);
    const cls = isBold ? 'font-bold' : '';
    const resultCls = (v) => isResult ? (v >= 0 ? 'text-success' : 'text-error') : '';
    return (
      <tr className={isBold ? 'bg-base-200' : ''}>
        <td className={`${cls} ${isBold ? 'text-sm' : 'text-sm pl-8'}`}>{label}</td>
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
              <tr><td colSpan="4" className="font-bold text-primary pt-4">RECETTES</td></tr>
              {row('Ventes visiteurs publics', (s) => s.scenarioResult?.revenuesVisitors)}
              {row('Ventes pompiers (part payante)', (s) => s.scenarioResult?.revenuesPompiers)}
              {row('Ventes arbitres (part payante)', (s) => s.scenarioResult?.revenuesArbitres)}
              {row('TOTAL RECETTES', (s) => s.scenarioResult?.totalRevenues, true)}

              <tr><td colSpan="4" className="font-bold text-primary pt-4">CHARGES</td></tr>
              {row('Charges offertes pompiers', (s) => s.scenarioResult?.chargesOffertsPompiers)}
              {row('Charges offertes arbitres', (s) => s.scenarioResult?.chargesOffertsArbitres)}
              {row('Charges offertes bénévoles', (s) => s.scenarioResult?.chargesOffertsBenevoles)}
              {row('Coûts de production (vendus)', (s) => s.scenarioResult?.productionCostsSold)}
              {row('Coûts fixes', (s) => s.scenarioResult?.fixedCosts)}
              {row('Coûts invendus non récupérables', (s) => s.scenarioResult?.unsoldCosts)}
              {row('TOTAL CHARGES', (s) => s.scenarioResult?.totalCharges, true)}

              <tr><td colSpan="4" className="pt-2" /></tr>
              {row('RÉSULTAT NET', (s) => s.scenarioResult?.netResult, true, true)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
