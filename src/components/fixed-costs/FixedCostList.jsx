import { useEffect, useState, useCallback } from 'react';
import { useFixedCostStore } from '../../stores/useFixedCostStore';
import { useToast } from '../../hooks/useToast';
import { FixedCostForm } from './FixedCostForm';
import { ConfirmModal } from '../shared/ConfirmModal';
import { FormModal } from '../shared/FormModal';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { DataTable } from '../shared/DataTable';

const CATEGORY_LABELS = {
  location: 'Location',
  consommable: 'Consommable',
  transport: 'Transport',
  autre: 'Autre',
};

const COLUMNS = [
  { key: 'name', header: 'Nom', sortable: true, searchable: true },
  { key: 'category', header: 'Catégorie', sortable: true, searchable: true },
  { key: 'supplier', header: 'Fournisseur', sortable: true, searchable: true },
  { key: 'amount', header: 'Montant', sortable: true, className: 'text-right' },
  { key: 'notes', header: 'Notes', searchable: true },
  { key: 'actions', header: 'Actions', className: 'w-32' },
];

export function FixedCostList() {
  const { fixedCosts, loading, fetchAll, remove } = useFixedCostStore();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const total = fixedCosts.reduce((s, fc) => s + Number(fc.amount || 0), 0);

  const getSearchValue = useCallback((item, key) => {
    if (key === 'supplier') return item.supplier?.name || '';
    if (key === 'category') return CATEGORY_LABELS[item.category] || item.category || '';
    if (key === 'amount') return String(item.amount || 0);
    return item[key] == null ? '' : String(item[key]);
  }, []);

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

      <FormModal
        open={editing !== null}
        title={editing === 'new' ? 'Nouveau coût fixe' : 'Modifier le coût fixe'}
        onClose={() => setEditing(null)}
      >
        <FixedCostForm
          fixedCost={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      </FormModal>

      <DataTable
        data={fixedCosts}
        columns={COLUMNS}
        getSearchValue={getSearchValue}
        emptyState={
          <EmptyState
            title="Aucun coût fixe"
            description="Ajoutez les coûts fixes de la manifestation (location, transport, etc.)."
            actionLabel="Ajouter un coût fixe"
            onAction={() => setEditing('new')}
          />
        }
        footer={
          <tfoot>
            <tr className="font-bold">
              <td colSpan="3">Total coûts fixes</td>
              <td className="text-right font-mono">{total.toFixed(2)} CHF</td>
              <td colSpan="2" />
            </tr>
          </tfoot>
        }
        renderCell={(fc) => (
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
        )}
      />

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
