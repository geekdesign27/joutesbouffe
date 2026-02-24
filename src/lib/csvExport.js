import Papa from 'papaparse';

const SCENARIO_LABELS = {
  pessimistic: 'Pessimiste',
  realistic: 'Realiste',
  optimistic: 'Optimiste',
};

export function exportDashboardCSV(scenario, results) {
  const label = SCENARIO_LABELS[scenario];
  const rows = [
    { categorie: 'RECETTES', poste: 'Ventes visiteurs publics',           montant_chf: fmt(results.revenuesVisitors) },
    { categorie: '',         poste: 'Ventes pompiers (part payante)',      montant_chf: fmt(results.revenuesPompiers) },
    { categorie: '',         poste: 'Ventes arbitres (part payante)',      montant_chf: fmt(results.revenuesArbitres) },
    { categorie: '',         poste: `TOTAL RECETTES -- ${label}`,          montant_chf: fmt(results.totalRevenues) },
    { categorie: '',         poste: '',                                    montant_chf: '' },
    { categorie: 'CHARGES',  poste: 'Charges offertes pompiers',          montant_chf: fmt(results.chargesOffertsPompiers) },
    { categorie: '',         poste: 'Charges offertes arbitres',          montant_chf: fmt(results.chargesOffertsArbitres) },
    { categorie: '',         poste: 'Charges offertes benevoles',         montant_chf: fmt(results.chargesOffertsBenevoles) },
    { categorie: '',         poste: 'Couts de production (vendus)',        montant_chf: fmt(results.productionCostsSold) },
    { categorie: '',         poste: 'Couts fixes',                        montant_chf: fmt(results.fixedCosts) },
    { categorie: '',         poste: 'Couts invendus non recuperables',    montant_chf: fmt(results.unsoldCosts) },
    { categorie: '',         poste: `TOTAL CHARGES -- ${label}`,           montant_chf: fmt(results.totalCharges) },
    { categorie: '',         poste: '',                                    montant_chf: '' },
    { categorie: 'RESULTAT', poste: `RESULTAT NET -- ${label}`,           montant_chf: fmt(results.netResult) },
  ];

  const csv = Papa.unparse(rows, {
    delimiter: ';',
    header: true,
    columns: ['categorie', 'poste', 'montant_chf'],
  });

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `catering_${scenario}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function fmt(value) {
  if (value == null) return '0,00';
  return Number(value).toFixed(2).replace('.', ',');
}
