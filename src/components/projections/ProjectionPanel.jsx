import { useState, useEffect } from 'react';
import { useProjectionStore } from '../../stores/useProjectionStore';
import { useProfileStore } from '../../stores/useProfileStore';
import { useConfigStore } from '../../stores/useConfigStore';
import { useTaxonomyStore } from '../../stores/useTaxonomyStore';
import { ScenarioTabs } from '../shared/ScenarioTabs';
import { ProfileProjection } from './ProfileProjection';
import { ConsumptionRates } from './ConsumptionRates';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export function ProjectionPanel() {
  const { loading, fetchAll } = useProjectionStore();
  const { profiles, fetchAll: fetchProfiles } = useProfileStore();
  const { fetchConfig } = useConfigStore();
  const { fetchAll: fetchTaxonomies } = useTaxonomyStore();
  const [scenario, setScenario] = useState('realistic');

  useEffect(() => {
    fetchAll();
    fetchProfiles();
    fetchConfig();
    fetchTaxonomies();
  }, [fetchAll, fetchProfiles, fetchConfig, fetchTaxonomies]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-semibold">Projections</h2>
        <ScenarioTabs active={scenario} onChange={setScenario} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Fréquentation par profil</h3>
            <div className="space-y-4 mt-2">
              {profiles.map((profile) => (
                <ProfileProjection
                  key={profile.id}
                  profile={profile}
                  scenario={scenario}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Taux de consommation</h3>
            <ConsumptionRates scenario={scenario} />
          </div>
        </div>
      </div>
    </div>
  );
}
