import { useState, useEffect } from 'react';
import { useProjectionStore } from '../../stores/useProjectionStore';
import { useConfigStore } from '../../stores/useConfigStore';
import { useToast } from '../../hooks/useToast';
import { ScenarioTabs } from '../shared/ScenarioTabs';
import { SliderInput } from '../shared/SliderInput';
import { calcVolunteerEntitlements } from '../../lib/calculations';

export function VolunteerShifts() {
  const { volunteerShifts, fetchAll, updateVolunteerShift } = useProjectionStore();
  const config = useConfigStore((s) => s.config);
  const toast = useToast();
  const [scenario, setScenario] = useState('realistic');

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const shifts = volunteerShifts.find((vs) => vs.scenario === scenario);

  const handleChange = async (field, value) => {
    if (!shifts) return;
    try {
      await updateVolunteerShift(shifts.id, { [field]: value });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const entitlements = shifts && config
    ? calcVolunteerEntitlements(shifts, config, 0, 0)
    : { totalHours: 0, meals: 0, drinks: 0, totalCost: 0 };

  return (
    <div className="border border-base-300 rounded-lg p-4">
      <h4 className="font-semibold text-sm mb-3">Shifts bénévoles</h4>
      <ScenarioTabs active={scenario} onChange={setScenario} />

      {shifts ? (
        <div className="space-y-4 mt-4">
          <SliderInput
            label="Bénévoles 1 shift"
            value={shifts.volunteers_1_shift || 0}
            onChange={(v) => handleChange('volunteers_1_shift', v)}
            max={100}
            unit="pers."
          />
          <SliderInput
            label="Bénévoles 2 shifts"
            value={shifts.volunteers_2_shifts || 0}
            onChange={(v) => handleChange('volunteers_2_shifts', v)}
            max={50}
            unit="pers."
          />
          <SliderInput
            label="Bénévoles 3 shifts"
            value={shifts.volunteers_3_shifts || 0}
            onChange={(v) => handleChange('volunteers_3_shifts', v)}
            max={30}
            unit="pers."
          />
          <SliderInput
            label="Variation consommation"
            value={shifts.consumption_variation_pct || 0}
            onChange={(v) => handleChange('consumption_variation_pct', v)}
            min={-50}
            max={50}
            unit="%"
          />
          <div className="alert alert-info text-sm mt-2">
            <div>
              <div>Heures totales : <strong>{entitlements.totalHours}</strong></div>
              <div>Repas dus : <strong>{entitlements.meals}</strong> | Boissons dues : <strong>{entitlements.drinks}</strong></div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-base-content/50 mt-2">Aucune donnée pour ce scénario.</p>
      )}
    </div>
  );
}
