import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = { low: '#E74C3C', medium: '#F39C12', good: '#2ECC71', not_sellable: '#95A5A6' };

export function MarginBarChart({ recipeDetails }) {
  const data = recipeDetails
    .filter((r) => r.selling_price > 0)
    .map((r) => ({
      name: r.name,
      marge: r.margin?.percentage || 0,
      status: r.margin?.status || 'not_sellable',
    }));

  if (!data.length) return <p className="text-sm text-base-content/50">Aucun produit vendable</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `${v}%`} />
        <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
        <Bar dataKey="marge">
          {data.map((entry, i) => <Cell key={i} fill={COLORS[entry.status]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
