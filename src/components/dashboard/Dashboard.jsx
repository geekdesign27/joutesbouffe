import { useState, useEffect } from 'react';
import { useRecipeStore } from '../../stores/useRecipeStore';
import { useIngredientStore } from '../../stores/useIngredientStore';
import { useProfileStore } from '../../stores/useProfileStore';
import { useProjectionStore } from '../../stores/useProjectionStore';
import { useFixedCostStore } from '../../stores/useFixedCostStore';
import { useConfigStore } from '../../stores/useConfigStore';
import { useTeamCategoryStore } from '../../stores/useTeamCategoryStore';
import { useCalculations } from '../../hooks/useCalculations';
import { SynthesisTable } from './SynthesisTable';
import { CostPieChart } from './CostPieChart';
import { ScenarioBarChart } from './ScenarioBarChart';
import { MarginBarChart } from './MarginBarChart';
import { BreakEvenChart } from './BreakEvenChart';
import { AlertsPanel } from './AlertsPanel';
import { CsvExportButton } from './CsvExportButton';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export function Dashboard() {
  const fetchRecipes = useRecipeStore((s) => s.fetchAll);
  const fetchIngredients = useIngredientStore((s) => s.fetchAll);
  const fetchProfiles = useProfileStore((s) => s.fetchAll);
  const fetchProjections = useProjectionStore((s) => s.fetchAll);
  const fetchFixedCosts = useFixedCostStore((s) => s.fetchAll);
  const fetchConfig = useConfigStore((s) => s.fetchConfig);
  const fetchTeamCategories = useTeamCategoryStore((s) => s.fetchAll);
  const configLoading = useConfigStore((s) => s.loading);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchRecipes(), fetchIngredients(), fetchProfiles(),
      fetchProjections(), fetchFixedCosts(), fetchConfig(),
      fetchTeamCategories(),
    ]).then(() => setLoaded(true));
  }, [fetchRecipes, fetchIngredients, fetchProfiles, fetchProjections, fetchFixedCosts, fetchConfig, fetchTeamCategories]);

  const pessimistic = useCalculations('pessimistic');
  const realistic = useCalculations('realistic');
  const optimistic = useCalculations('optimistic');

  if (!loaded || configLoading) return <LoadingSpinner />;

  const scenarios = { pessimistic, realistic, optimistic };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-semibold">Dashboard de synthèse</h2>
        <CsvExportButton scenarios={scenarios} />
      </div>

      <AlertsPanel alerts={realistic.alerts} />

      <SynthesisTable scenarios={scenarios} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Répartition des charges (réaliste)</h3>
            <CostPieChart result={realistic.scenarioResult} />
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Recettes vs Charges par scénario</h3>
            <ScenarioBarChart scenarios={scenarios} />
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Marges par produit</h3>
            <MarginBarChart recipeDetails={realistic.recipeDetails} />
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Seuil de rentabilité</h3>
            <BreakEvenChart scenarios={scenarios} />
          </div>
        </div>
      </div>
    </div>
  );
}
