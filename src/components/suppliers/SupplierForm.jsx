import { useState } from 'react';
import { useSupplierStore } from '../../stores/useSupplierStore';
import { useToast } from '../../hooks/useToast';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

export function SupplierForm({ supplier, onClose }) {
  const { create, update } = useSupplierStore();
  const toast = useToast();
  const isEdit = !!supplier;

  const [form, setForm] = useState({
    name: supplier?.name || '',
    contact: supplier?.contact || '',
    notes: supplier?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Le nom est obligatoire');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await update(supplier.id, form);
        toast.success('Fournisseur modifié');
      } else {
        await create(form);
        toast.success('Fournisseur créé');
      }
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-sm mb-4">
      <div className="card-body">
        <h3 className="card-title text-base">{isEdit ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <FormField label="Nom" required>
            <Input type="text" value={form.name} onChange={handleChange('name')} required />
          </FormField>
          <FormField label="Contact">
            <Input type="text" value={form.contact} onChange={handleChange('contact')} />
          </FormField>
          <FormField label="Notes" className="md:col-span-2">
            <Textarea value={form.notes} onChange={handleChange('notes')} rows="2" />
          </FormField>
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? <span className="loading loading-spinner loading-xs" /> : null}
              {isEdit ? 'Enregistrer' : 'Créer'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
