import { useState, useEffect } from 'react';
import { useProfileStore } from '../../stores/useProfileStore';
import { useTaxonomyStore } from '../../stores/useTaxonomyStore';
import { useToast } from '../../hooks/useToast';
import { ScenarioTabs } from '../shared/ScenarioTabs';
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
      className="input-sm"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={handleBlur}
      min="0"
      step="0.1"
    />
  );
}

export function MixedConsumption({ profileId }) {
  const { payingConsumption, upsertPayingConsumption } = useProfileStore();
  const { getOptions } = useTaxonomyStore();
  const toast = useToast();

  const recipeCategories = getOptions('recipe_type');
  const [scenario, setScenario] = useState('realistic');

  const currentData = payingConsumption.filter(
    (pc) => pc.profile_id === profileId && pc.scenario === scenario
  );

  const getRate = (category) => {
    const found = currentData.find((d) => d.recipe_category === category);
    return found?.rate_per_person || 0;
  };

  const handleSave = async (category, value) => {
    try {
      await upsertPayingConsumption({
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
    <div className="border border-base-300 rounded-lg p-4">
      <h4 className="font-semibold text-sm mb-3">Consommation payante additionnelle</h4>
      <ScenarioTabs active={scenario} onChange={setScenario} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {recipeCategories.map((cat) => (
          <FormField key={cat.value} label={`${cat.label} (moy. par pers.)`}>
            <RateInput
              value={getRate(cat.value)}
              onSave={(v) => handleSave(cat.value, v)}
            />
          </FormField>
        ))}
      </div>
    </div>
  );
}
