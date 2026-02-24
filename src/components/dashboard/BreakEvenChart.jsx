import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

export function BreakEvenChart({ scenarios }) {
  const realistic = scenarios.realistic.scenarioResult;
  if (!realistic) return <p className="text-sm text-base-content/50">Aucune donnée</p>;

  const totalRevenues = realistic.totalRevenues || 1;
  const totalCharges = realistic.totalCharges || 0;
  const fixedCosts = realistic.fixedCosts || 0;

  // Simuler l'evolution des recettes/charges en fonction du % de frequentation
  const data = [];
  for (let pct = 0; pct <= 150; pct += 10) {
    const factor = pct / 100;
    const rev = totalRevenues * factor;
    const variableCharges = (totalCharges - fixedCosts) * factor;
    const charges = fixedCosts + variableCharges;
    data.push({
      frequentation: `${pct}%`,
      Recettes: Math.round(rev),
      Charges: Math.round(charges),
    });
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="frequentation" />
        <YAxis tickFormatter={(v) => `${v}`} />
        <Tooltip formatter={(v) => `CHF ${Number(v).toFixed(0)}`} />
        <Legend />
        <ReferenceLine y={0} stroke="#666" />
        <Line type="monotone" dataKey="Recettes" stroke="#2ECC71" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Charges" stroke="#E74C3C" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
