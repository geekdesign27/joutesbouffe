import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function ScenarioBarChart({ scenarios }) {
  const data = [
    { name: 'Pessimiste', Recettes: scenarios.pessimistic.scenarioResult?.totalRevenues || 0, Charges: scenarios.pessimistic.scenarioResult?.totalCharges || 0 },
    { name: 'Réaliste', Recettes: scenarios.realistic.scenarioResult?.totalRevenues || 0, Charges: scenarios.realistic.scenarioResult?.totalCharges || 0 },
    { name: 'Optimiste', Recettes: scenarios.optimistic.scenarioResult?.totalRevenues || 0, Charges: scenarios.optimistic.scenarioResult?.totalCharges || 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(v) => `${v}`} />
        <Tooltip formatter={(v) => `CHF ${Number(v).toFixed(2)}`} />
        <Legend />
        <Bar dataKey="Recettes" fill="#2ECC71" />
        <Bar dataKey="Charges" fill="#E74C3C" />
      </BarChart>
    </ResponsiveContainer>
  );
}
