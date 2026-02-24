import { useEffect, useState } from 'react';
import { useFixedCostStore } from '../../stores/useFixedCostStore';
import { useToast } from '../../hooks/useToast';
import { FixedCostForm } from './FixedCostForm';
import { ConfirmModal } from '../shared/ConfirmModal';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';

const CATEGORY_LABELS = {
  location: 'Location',
  consommable: 'Consommable',
  transport: 'Transport',
  autre: 'Autre',
};

export function FixedCostList() {
  const { fixedCosts, loading, fetchAll, remove } = useFixedCostStore();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const total = fixedCosts.reduce((s, fc) => s + Number(fc.amount || 0), 0);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting.id);
      toast.success('Coût fixe supprimé');
    } catch (err) {
      toast.error(err.message);
    }
    setDeleting(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Coûts fixes</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
          + Ajouter
        </button>
      </div>

      {editing !== null && (
        <FixedCostForm
          fixedCost={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      {!fixedCosts.length ? (
        <EmptyState
          title="Aucun coût fixe"
          description="Ajoutez les coûts fixes de la manifestation (location, transport, etc.)."
          actionLabel="Ajouter un coût fixe"
          onAction={() => setEditing('new')}
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Fournisseur</th>
                  <th className="text-right">Montant</th>
                  <th>Notes</th>
                  <th className="w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fixedCosts.map((fc) => (
                  <tr key={fc.id}>
                    <td className="font-medium">{fc.name}</td>
                    <td><span className="badge badge-ghost badge-sm">{CATEGORY_LABELS[fc.category] || fc.category}</span></td>
                    <td>{fc.supplier?.name || '—'}</td>
                    <td className="text-right font-mono">{Number(fc.amount).toFixed(2)} CHF</td>
                    <td className="text-sm text-base-content/60">{fc.notes || '—'}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-xs" onClick={() => setEditing(fc)}>Modifier</button>
                        <button className="btn btn-ghost btn-xs text-error" onClick={() => setDeleting(fc)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan="3">Total coûts fixes</td>
                  <td className="text-right font-mono">{total.toFixed(2)} CHF</td>
                  <td colSpan="2" />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      <ConfirmModal
        open={!!deleting}
        title="Supprimer le coût fixe"
        message={`Voulez-vous vraiment supprimer « ${deleting?.name} » ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
