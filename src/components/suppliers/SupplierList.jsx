import { useEffect, useState } from 'react';
import { useSupplierStore } from '../../stores/useSupplierStore';
import { useToast } from '../../hooks/useToast';
import { SupplierForm } from './SupplierForm';
import { ConfirmModal } from '../shared/ConfirmModal';
import { CsvImportModal } from '../shared/CsvImportModal';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';

const SUPPLIER_CSV_COLUMNS = ['nom', 'contact', 'notes'];

function validateSupplierRow(row) {
  if (!row.nom?.trim()) return 'Nom obligatoire';
  return null;
}

export function SupplierList() {
  const { suppliers, loading, fetchAll, remove, bulkCreate } = useSupplierStore();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting.id);
      toast.success('Fournisseur supprimé');
    } catch (err) {
      toast.error(err.message);
    }
    setDeleting(null);
  };

  const handleCsvImport = async (validRows) => {
    const items = validRows.map((row) => ({
      name: row.nom.trim(),
      contact: row.contact?.trim() || null,
      notes: row.notes?.trim() || null,
    }));
    await bulkCreate(items);
    toast.success(`${items.length} fournisseur(s) importé(s)`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Fournisseurs</h2>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={() => setShowImport(true)}>
            Importer CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
            + Ajouter
          </button>
        </div>
      </div>

      {editing !== null && (
        <SupplierForm
          supplier={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      {!suppliers.length ? (
        <EmptyState
          title="Aucun fournisseur"
          description="Ajoutez vos fournisseurs pour commencer."
          actionLabel="Ajouter un fournisseur"
          onAction={() => setEditing('new')}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Contact</th>
                <th>Notes</th>
                <th className="w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.name}</td>
                  <td>{s.contact || '—'}</td>
                  <td className="text-sm text-base-content/60">{s.notes || '—'}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-xs" onClick={() => setEditing(s)}>Modifier</button>
                      <button className="btn btn-ghost btn-xs text-error" onClick={() => setDeleting(s)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!deleting}
        title="Supprimer le fournisseur"
        message={`Voulez-vous vraiment supprimer « ${deleting?.name} » ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      <CsvImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        columns={SUPPLIER_CSV_COLUMNS}
        validate={validateSupplierRow}
        onImport={handleCsvImport}
        templateFileName="fournisseurs_template.csv"
      />
    </div>
  );
}
