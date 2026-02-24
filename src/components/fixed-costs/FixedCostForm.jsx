import { useState, useEffect } from 'react';
import { useFixedCostStore } from '../../stores/useFixedCostStore';
import { useSupplierStore } from '../../stores/useSupplierStore';
import { useToast } from '../../hooks/useToast';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

const CATEGORIES = [
  { value: 'location', label: 'Location' },
  { value: 'consommable', label: 'Consommable' },
  { value: 'transport', label: 'Transport' },
  { value: 'autre', label: 'Autre' },
];

export function FixedCostForm({ fixedCost, onClose }) {
  const { create, update } = useFixedCostStore();
  const { suppliers, fetchAll: fetchSuppliers } = useSupplierStore();
  const toast = useToast();
  const isEdit = !!fixedCost;

  const [form, setForm] = useState({
    name: fixedCost?.name || '',
    supplier_id: fixedCost?.supplier_id || '',
    amount: fixedCost?.amount || 0,
    category: fixedCost?.category || 'autre',
    notes: fixedCost?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Le nom est obligatoire'); return; }
    setSaving(true);
    try {
      const data = { ...form, supplier_id: form.supplier_id || null };
      if (isEdit) {
        await update(fixedCost.id, data);
        toast.success('Coût fixe modifié');
      } else {
        await create(data);
        toast.success('Coût fixe créé');
      }
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const supplierOptions = suppliers.map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="card bg-base-100 shadow-sm mb-4">
      <div className="card-body">
        <h3 className="card-title text-base">{isEdit ? 'Modifier le coût fixe' : 'Nouveau coût fixe'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <FormField label="Nom" required>
            <Input type="text" value={form.name} onChange={handleChange('name')} required />
          </FormField>
          <FormField label="Catégorie">
            <Select value={form.category} onChange={handleChange('category')} options={CATEGORIES} />
          </FormField>
          <FormField label="Montant (CHF)">
            <Input type="number" value={form.amount} onChange={handleChange('amount')} min="0" step="0.01" />
          </FormField>
          <FormField label="Fournisseur">
            <Select value={form.supplier_id} onChange={handleChange('supplier_id')} options={supplierOptions} placeholder="— Aucun —" />
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
