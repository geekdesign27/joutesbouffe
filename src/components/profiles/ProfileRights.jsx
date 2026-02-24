import { useState } from 'react';
import { useProfileStore } from '../../stores/useProfileStore';
import { useRecipeStore } from '../../stores/useRecipeStore';
import { useToast } from '../../hooks/useToast';

const RIGHT_TYPES = [
  { value: 'fixed', label: 'Quantité fixe' },
  { value: 'per_shift_hours', label: 'Par shift (repas)' },
  { value: 'per_service_hours', label: 'Par service (boissons)' },
];

const RECIPE_CATEGORIES = [
  { value: 'repas', label: 'Repas' },
  { value: 'boisson_froide', label: 'Boisson froide' },
  { value: 'boisson_chaude', label: 'Boisson chaude' },
  { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Dessert' },
];

export function ProfileRights({ profileId }) {
  const { rights, addRight, updateRight, removeRight } = useProfileStore();
  const { recipes } = useRecipeStore();
  const toast = useToast();
  const profileRights = rights.filter((r) => r.profile_id === profileId);

  const [newRight, setNewRight] = useState({
    recipe_category: 'repas',
    recipe_id: '',
    quantity_per_right: 1,
    right_type: 'fixed',
    hours_per_unit: null,
    notes: '',
  });

  const handleAdd = async () => {
    try {
      await addRight({
        profile_id: profileId,
        ...newRight,
        recipe_id: newRight.recipe_id || null,
      });
      toast.success('Droit ajouté');
      setNewRight({ recipe_category: 'repas', recipe_id: '', quantity_per_right: 1, right_type: 'fixed', hours_per_unit: null, notes: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeRight(id);
      toast.success('Droit supprimé');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="border border-base-300 rounded-lg p-4">
      <h4 className="font-semibold text-sm mb-3">Droits offerts</h4>

      {profileRights.length > 0 && (
        <div className="space-y-2 mb-4">
          {profileRights.map((right) => (
            <div key={right.id} className="flex items-center gap-2 bg-base-200 rounded-lg p-2 text-sm">
              <span className="flex-1">
                {right.quantity_per_right}× {right.recipe_category?.replace('_', ' ')}
                {right.right_type !== 'fixed' && ` (par ${right.hours_per_unit}h)`}
              </span>
              {right.notes && <span className="text-xs text-base-content/50">{right.notes}</span>}
              <button className="btn btn-ghost btn-xs text-error" onClick={() => handleRemove(right.id)}>×</button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <select className="select select-xs" value={newRight.recipe_category} onChange={(e) => setNewRight((p) => ({ ...p, recipe_category: e.target.value }))}>
          {RECIPE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select className="select select-xs" value={newRight.right_type} onChange={(e) => setNewRight((p) => ({ ...p, right_type: e.target.value }))}>
          {RIGHT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input type="number" className="input input-xs" value={newRight.quantity_per_right} onChange={(e) => setNewRight((p) => ({ ...p, quantity_per_right: Number(e.target.value) }))} min="1" />
        <button className="btn btn-primary btn-xs" onClick={handleAdd}>Ajouter</button>
      </div>
    </div>
  );
}
