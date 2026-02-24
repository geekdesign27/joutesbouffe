import { AlertBanner } from '../shared/AlertBanner';

export function AlertsPanel({ alerts }) {
  if (!alerts || !alerts.length) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <AlertBanner key={i} type={alert.type} message={alert.message} />
      ))}
    </div>
  );
}
