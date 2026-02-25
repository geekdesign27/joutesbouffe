import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#E74C3C', '#3498DB', '#F39C12', '#2ECC71', '#9B59B6', '#1ABC9C'];

export function CostPieChart({ result }) {
  if (!result) return <p className="text-sm text-base-content/50">Aucune donnée</p>;

  const data = [
    { name: 'Offerts bénévoles', value: result.chargesOffertsBenevoles || 0 },
    { name: 'Boissons offertes (éq.)', value: result.chargesCotisationsDrinks || 0 },
    { name: 'Repas offerts (éq.)', value: result.chargesCotisationsMeals || 0 },
    { name: 'Production (vendus)', value: result.productionCostsSold || 0 },
    { name: 'Coûts fixes', value: result.fixedCosts || 0 },
    { name: 'Invendus', value: result.unsoldCosts || 0 },
  ].filter((d) => d.value > 0);

  if (!data.length) return <p className="text-sm text-base-content/50">Aucune charge à afficher</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => `CHF ${Number(v).toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
