import { useEffect, useState } from 'react';
import { useTaxonomyStore } from '../../stores/useTaxonomyStore';
import { useToast } from '../../hooks/useToast';
import { ConfirmModal } from '../shared/ConfirmModal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';

const emptyForm = { value: '', label: '', sort_order: 0 };

export function TaxonomyList({ type, title }) {
  const { items, loading, fetchByType, create, update, remove } = useTaxonomyStore();
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const taxonomies = items[type] || [];

  useEffect(() => { fetchByType(type); }, [type, fetchByType]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ value: item.value, label: item.label, sort_order: item.sort_order });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.value.trim() || !form.label.trim()) {
      toast.error('Valeur et libellé sont obligatoires');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await update(editingId, { ...form, type });
        toast.success('Entrée modifiée');
      } else {
        await create({ ...form, type });
        toast.success('Entrée ajoutée');
      }
      cancelEdit();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting.id, type);
      toast.success('Entrée supprimée');
    } catch (err) {
      toast.error(err.message);
    }
    setDeleting(null);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>

      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-sm mb-4">
        <div className="card-body py-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <FormField label="Valeur (code)">
              <Input
                type="text"
                value={form.value}
                onChange={handleChange('value')}
                placeholder="ex: kg"
                disabled={!!editingId}
                required
              />
            </FormField>
            <FormField label="Libellé (affiché)">
              <Input
                type="text"
                value={form.label}
                onChange={handleChange('label')}
                placeholder="ex: Kilogramme"
                required
              />
            </FormField>
            <FormField label="Ordre">
              <Input
                type="number"
                value={form.sort_order}
                onChange={handleChange('sort_order')}
                min="0"
                step="1"
              />
            </FormField>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving && <span className="loading loading-spinner loading-xs" />}
                {editingId ? 'Modifier' : 'Ajouter'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={cancelEdit}>
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-md" />
        </div>
      ) : !taxonomies.length ? (
        <p className="text-base-content/60 text-sm">Aucune entrée.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Valeur</th>
                <th>Libellé</th>
                <th className="text-right">Ordre</th>
                <th className="w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxonomies.map((item) => (
                <tr key={item.id}>
                  <td className="font-mono text-sm">{item.value}</td>
                  <td>{item.label}</td>
                  <td className="text-right">{item.sort_order}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-xs" onClick={() => startEdit(item)}>
                        Modifier
                      </button>
                      <button className="btn btn-ghost btn-xs text-error" onClick={() => setDeleting(item)}>
                        Supprimer
                      </button>
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
        title="Supprimer l'entrée"
        message={`Voulez-vous vraiment supprimer « ${deleting?.label} » ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
