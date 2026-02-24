import { useState, useEffect } from 'react';
import { useProjectionStore } from '../../stores/useProjectionStore';
import { useProfileStore } from '../../stores/useProfileStore';
import { useTaxonomyStore } from '../../stores/useTaxonomyStore';
import { useToast } from '../../hooks/useToast';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';

function RateInput({ value, onSave }) {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);

  const handleBlur = () => {
    const num = Number(local);
    if (num !== value) onSave(num);
  };

  return (
    <Input
      type="number"
      className="input-xs font-mono"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={handleBlur}
      min="0"
      step="0.1"
    />
  );
}

export function ConsumptionRates({ scenario }) {
  const { consumptionRates, upsertConsumptionRate } = useProjectionStore();
  const { profiles } = useProfileStore();
  const { getOptions } = useTaxonomyStore();
  const toast = useToast();

  const recipeCategories = getOptions('recipe_type');

  // Seuls les profils payants ou mixtes ont des taux de consommation
  const payingProfiles = profiles.filter(
    (p) => p.type === 'paying' || p.has_paying_consumption
  );

  const getRate = (profileId, category) => {
    const found = consumptionRates.find(
      (cr) => cr.profile_id === profileId && cr.recipe_category === category && cr.scenario === scenario
    );
    return found?.rate_per_person || 0;
  };

  const handleSave = async (profileId, category, value) => {
    try {
      await upsertConsumptionRate({
        profile_id: profileId,
        recipe_category: category,
        scenario,
        rate_per_person: value,
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4 mt-2">
      {payingProfiles.map((profile) => (
        <div key={profile.id} className="border border-base-300 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: profile.color }}
            />
            <span className="font-medium text-sm">{profile.name}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {recipeCategories.map((cat) => (
              <FormField key={cat.value} label={cat.label}>
                <RateInput
                  value={getRate(profile.id, cat.value)}
                  onSave={(v) => handleSave(profile.id, cat.value, v)}
                />
              </FormField>
            ))}
          </div>
        </div>
      ))}

      {!payingProfiles.length && (
        <p className="text-sm text-base-content/50">Aucun profil payant configuré.</p>
      )}
    </div>
  );
}
