import { useState, useEffect } from 'react';
import { useIngredientStore } from '../../stores/useIngredientStore';
import { useSupplierStore } from '../../stores/useSupplierStore';
import { useTaxonomyStore } from '../../stores/useTaxonomyStore';
import { useToast } from '../../hooks/useToast';
import { getConversionFactor } from '../../lib/calculations';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Textarea } from '../ui/Textarea';
import { ReadonlyField } from '../ui/ReadonlyField';

export function IngredientForm({ ingredient, onClose }) {
  const { create, update } = useIngredientStore();
  const { suppliers, fetchAll: fetchSuppliers } = useSupplierStore();
  const { getOptions, getLabelMap, fetchAll: fetchTaxonomies } = useTaxonomyStore();
  const toast = useToast();
  const isEdit = !!ingredient;

  const [form, setForm] = useState({
    name: ingredient?.name || '',
    supplier_id: ingredient?.supplier_id || '',
    purchase_unit: ingredient?.purchase_unit || 'piece',
    purchase_quantity: ingredient?.purchase_quantity || 1,
    purchase_price: ingredient?.purchase_price || 0,
    items_per_purchase: ingredient?.items_per_purchase || 1,
    item_volume: ingredient?.item_volume || '',
    item_volume_unit: ingredient?.item_volume_unit || '',
    serving_unit: ingredient?.serving_unit || '',
    serving_quantity: ingredient?.serving_quantity || 1,
    waste_rate: ingredient?.waste_rate || 0,
    returnable: ingredient?.returnable || false,
    returnable_condition: ingredient?.returnable_condition || '',
    perishable: ingredient?.perishable || false,
    category: ingredient?.category || 'alimentaire',
    notes: ingredient?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSuppliers(); fetchTaxonomies(); }, [fetchSuppliers, fetchTaxonomies]);

  // --- Computed prices ---
  const unitPrice = form.purchase_quantity > 0
    ? form.purchase_price / form.purchase_quantity
    : 0;

  const itemsPerPurchase = form.items_per_purchase || 1;
  const itemPrice = unitPrice / itemsPerPurchase;

  const servingUnitPrice = form.serving_quantity > 0 && form.serving_unit
    ? itemPrice / form.serving_quantity
    : null;

  // --- Options ---
  const unitOptions = getOptions('purchase_unit');
  const servingUnitOptions = getOptions('serving_unit');
  const categoryOptions = getOptions('ingredient_category');
  const purchaseUnitLabel = getLabelMap('purchase_unit')[form.purchase_unit] || form.purchase_unit;

  // --- Auto-calc serving_quantity from item_volume conversion ---
  const computeServingQuantity = (itemVolume, itemVolumeUnit, servingUnit) => {
    if (!itemVolume || !itemVolumeUnit || !servingUnit) return null;
    const factor = getConversionFactor(itemVolumeUnit, servingUnit);
    if (factor === null) return null;
    return Number(itemVolume) * factor;
  };

  const autoServingQty = computeServingQuantity(form.item_volume, form.item_volume_unit, form.serving_unit);
  const isAutoCalc = autoServingQty !== null;

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked
      : e.target.type === 'number' ? Number(e.target.value)
      : e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-calc serving_quantity when relevant fields change
      if (['item_volume', 'item_volume_unit', 'serving_unit'].includes(field)) {
        const iv = field === 'item_volume' ? value : prev.item_volume;
        const ivu = field === 'item_volume_unit' ? value : prev.item_volume_unit;
        const su = field === 'serving_unit' ? value : prev.serving_unit;
        const auto = computeServingQuantity(iv, ivu, su);
        if (auto !== null) {
          next.serving_quantity = auto;
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Le nom est obligatoire'); return; }
    setSaving(true);
    try {
      const data = {
        ...form,
        supplier_id: form.supplier_id || null,
        item_volume: form.item_volume || null,
        item_volume_unit: form.item_volume_unit || null,
      };
      if (isEdit) {
        await update(ingredient.id, data);
        toast.success('Ingrédient modifié');
      } else {
        await create(data);
        toast.success('Ingrédient créé');
      }
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const supplierOptions = suppliers.map((s) => ({ value: s.id, label: s.name }));

  const fmt = (n) => Number(n).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  return (
    <div className="card bg-base-100 shadow-sm mb-4">
      <div className="card-body">
        <h3 className="card-title text-base">{isEdit ? "Modifier l'ingrédient" : 'Nouvel ingrédient'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

          {/* Section 1 — Identification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Nom" required>
              <Input type="text" value={form.name} onChange={handleChange('name')} required />
            </FormField>
            <FormField label="Fournisseur">
              <Select value={form.supplier_id} onChange={handleChange('supplier_id')} options={supplierOptions} placeholder="— Aucun —" />
            </FormField>
            <FormField label="Catégorie">
              <Select value={form.category} onChange={handleChange('category')} options={categoryOptions} />
            </FormField>
          </div>

          {/* Section 2 — Conditionnement (achat) */}
          <div className="border-t border-base-300 pt-3">
            <p className="text-sm font-semibold mb-2">Conditionnement (achat)</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Conditionnement">
                <Select value={form.purchase_unit} onChange={handleChange('purchase_unit')} options={unitOptions} />
              </FormField>
              <FormField label="Nb par achat">
                <Input type="number" value={form.purchase_quantity} onChange={handleChange('purchase_quantity')} min="0.01" step="0.01" />
              </FormField>
              <FormField label="Prix total (CHF)">
                <Input type="number" value={form.purchase_price} onChange={handleChange('purchase_price')} min="0" step="0.01" />
              </FormField>
              <ReadonlyField label="Prix par cond." value={`${fmt(unitPrice)} CHF/${purchaseUnitLabel}`} />
            </div>
          </div>

          {/* Section 3 — Contenu du conditionnement */}
          <div className="border-t border-base-300 pt-3">
            <p className="text-sm font-semibold mb-1">Contenu du conditionnement</p>
            <p className="text-xs text-base-content/60 mb-2">
              Combien d'unités individuelles dans 1 {purchaseUnitLabel} ? Quelle contenance par unité ?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label={`Nb d'unités par ${purchaseUnitLabel}`}>
                <Input type="number" value={form.items_per_purchase} onChange={handleChange('items_per_purchase')} min="1" step="1" />
              </FormField>
              <FormField label="Contenance par unité">
                <Input type="number" value={form.item_volume} onChange={handleChange('item_volume')} min="0" step="0.01" placeholder="ex: 1.5" />
              </FormField>
              <FormField label="Mesure">
                <Select value={form.item_volume_unit} onChange={handleChange('item_volume_unit')} options={servingUnitOptions} placeholder="—" />
              </FormField>
              <ReadonlyField label="Prix par unité" value={`${fmt(itemPrice)} CHF`} />
            </div>
          </div>

          {/* Section 4 — Service (recettes) */}
          <div className="border-t border-base-300 pt-3">
            <p className="text-sm font-semibold mb-1">Service (recettes)</p>
            <p className="text-xs text-base-content/60 mb-2">
              Dans quelle unité cet ingrédient est-il dosé dans les recettes ?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Unité de service">
                <Select value={form.serving_unit} onChange={handleChange('serving_unit')} options={servingUnitOptions} placeholder="— Même que l'achat —" />
              </FormField>
              <FormField label={form.serving_unit ? `Nb de ${form.serving_unit} par unité` : "Nb par unité"}>
                <Input type="number" value={form.serving_quantity} onChange={handleChange('serving_quantity')} min="0" step="0.01" />
              </FormField>
              {servingUnitPrice !== null && (
                <ReadonlyField
                  label={`Prix par ${form.serving_unit}`}
                  value={`${fmt(servingUnitPrice)} CHF/${form.serving_unit}`}
                />
              )}
              {isAutoCalc && (
                <div className="flex items-end pb-2">
                  <span className="badge badge-success badge-sm">auto</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 5 — Caractéristiques */}
          <div className="border-t border-base-300 pt-3">
            <p className="text-sm font-semibold mb-2">Caractéristiques</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Taux de perte (%)">
                <Input type="number" value={form.waste_rate} onChange={handleChange('waste_rate')} min="0" max="100" step="1" />
              </FormField>
              <div className="flex flex-col justify-end gap-2">
                <Checkbox label="Retournable" checked={form.returnable} onChange={handleChange('returnable')} />
                <Checkbox label="Périssable" checked={form.perishable} onChange={handleChange('perishable')} />
              </div>
              {form.returnable && (
                <FormField label="Condition de retour">
                  <Input type="text" value={form.returnable_condition} onChange={handleChange('returnable_condition')} placeholder="ex: non ouvert, non entamé" />
                </FormField>
              )}
            </div>
            <div className="mt-3">
              <FormField label="Notes">
                <Textarea value={form.notes} onChange={handleChange('notes')} rows="2" />
              </FormField>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
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
