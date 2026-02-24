import { useState } from 'react';
import { exportDashboardCSV } from '../../lib/csvExport';
import { useToast } from '../../hooks/useToast';

export function CsvExportButton({ scenarios }) {
  const toast = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExport = (scenario) => {
    setExporting(true);
    try {
      const result = scenarios[scenario]?.scenarioResult;
      if (!result) {
        toast.error('Aucune donnée à exporter');
        return;
      }
      exportDashboardCSV(scenario, result);
      toast.success(`Export ${scenario} téléchargé`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-sm btn-outline" disabled={exporting}>
        {exporting ? <span className="loading loading-spinner loading-xs" /> : null}
        Exporter CSV
      </label>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li><button onClick={() => handleExport('pessimistic')}>Pessimiste</button></li>
        <li><button onClick={() => handleExport('realistic')}>Réaliste</button></li>
        <li><button onClick={() => handleExport('optimistic')}>Optimiste</button></li>
      </ul>
    </div>
  );
}
