import { useEffect, useState } from 'react';
import { usePdfImportStore } from '../../stores/usePdfImportStore';
import { ConfirmModal } from '../shared/ConfirmModal';
import { useToast } from '../../hooks/useToast';

export function PdfImportHistory() {
  const { batches, fetchBatches, rollbackBatch, loading } =
    usePdfImportStore();
  const toast = useToast();
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleRollback = async () => {
    if (!deleting) return;
    try {
      await rollbackBatch(deleting.id);
      toast.success(`Import "${deleting.label}" annulé`);
    } catch (err) {
      toast.error(`Erreur rollback : ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  if (batches.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Historique des imports</h3>
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Label</th>
              <th>Date</th>
              <th>Fournisseur</th>
              <th>Fichier</th>
              <th>Articles</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id}>
                <td>{batch.label}</td>
                <td>
                  {new Date(batch.created_at).toLocaleDateString('fr-CH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td>{batch.supplier?.name || '—'}</td>
                <td className="text-xs">{batch.source_file || '—'}</td>
                <td>{batch.item_count}</td>
                <td>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    disabled={loading}
                    onClick={() => setDeleting(batch)}
                  >
                    Annuler
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleting}
        title="Annuler l'import"
        message={`Supprimer tous les éléments de l'import "${deleting?.label}" ? Cette action est irréversible.`}
        onConfirm={handleRollback}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
