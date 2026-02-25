import { useState, useEffect } from 'react';
import { useProjectionStore } from '../../stores/useProjectionStore';
import { useTaxonomyStore } from '../../stores/useTaxonomyStore';
import { useToast } from '../../hooks/useToast';
import { ScenarioTabs } from '../shared/ScenarioTabs';
import { SliderInput } from '../shared/SliderInput';
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

export function ProfileConsumptionRates({ profileId, showRates }) {
  const {
    headcounts, updateHeadcount,
    consumptionRates, upsertConsumptionRate,
    fetchAll: fetchProjections,
  } = useProjectionStore();
  const { getOptions, fetchAll: fetchTaxonomies } = useTaxonomyStore();
  const toast = useToast();

  const recipeCategories = getOptions('recipe_type');
  const [scenario, setScenario] = useState('realistic');

  useEffect(() => {
    fetchProjections();
    fetchTaxonomies();
  }, [fetchProjections, fetchTaxonomies]);

  // Headcount for this profile + scenario
  const headcount = headcounts.find(
    (h) => h.profile_id === profileId && h.scenario === scenario
  );

  const handleCountChange = async (value) => {
    if (!headcount) return;
    try {
      await updateHeadcount(headcount.id, { count: value });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleVariationChange = async (value) => {
    if (!headcount) return;
    try {
      await updateHeadcount(headcount.id, { variation_pct: value });
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Consumption rates for this profile + scenario
  const currentRates = consumptionRates.filter(
    (cr) => cr.profile_id === profileId && cr.scenario === scenario
  );

  const getRate = (category) => {
    const found = currentRates.find((d) => d.recipe_category === category);
    return found?.rate_per_person || 0;
  };

  const handleRateSave = async (category, value) => {
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
    <div className="border border-base-300 rounded-lg p-4 space-y-4">
      <ScenarioTabs active={scenario} onChange={setScenario} />

      <div>
        <h4 className="font-semibold text-sm mb-3">Fréquentation</h4>
        <div className="space-y-3">
          <SliderInput
            label="Nombre de personnes"
            value={headcount?.count || 0}
            onChange={handleCountChange}
            max={1000}
            unit="pers."
          />
          <SliderInput
            label="Variation consommation"
            value={headcount?.variation_pct || 0}
            onChange={handleVariationChange}
            min={-50}
            max={50}
            unit="%"
          />
        </div>
      </div>

      {showRates && (
        <div>
          <h4 className="font-semibold text-sm mb-3">Taux de consommation payante</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipeCategories.map((cat) => (
              <FormField key={cat.value} label={`${cat.label} (moy. par pers.)`}>
                <RateInput
                  value={getRate(cat.value)}
                  onSave={(v) => handleRateSave(cat.value, v)}
                />
              </FormField>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
