import { marginStatusColor } from '../../lib/calculations';

export function MarginBadge({ margin }) {
  if (!margin) return null;

  const colorClass = marginStatusColor(margin.status);

  return (
    <span className={`badge ${colorClass} badge-sm`}>
      {margin.status === 'not_sellable'
        ? 'Non vendable'
        : `${margin.percentage.toFixed(1)}%`}
    </span>
  );
}
