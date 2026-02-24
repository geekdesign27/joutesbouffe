import { useProjectionStore } from '../../stores/useProjectionStore';
import { useToast } from '../../hooks/useToast';
import { SliderInput } from '../shared/SliderInput';

export function ProfileProjection({ profile, scenario }) {
  const { headcounts, updateHeadcount } = useProjectionStore();
  const toast = useToast();

  const headcount = headcounts.find(
    (h) => h.profile_id === profile.id && h.scenario === scenario
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

  return (
    <div className="border border-base-300 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: profile.color }}
        />
        <span className="font-medium text-sm">{profile.name}</span>
      </div>
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
        className="mt-2"
      />
    </div>
  );
}
