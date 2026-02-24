import { useState } from 'react';
import { TaxonomyList } from './TaxonomyList';

const TABS = [
  { type: 'purchase_unit', label: "Unités d'achat" },
  { type: 'serving_unit', label: 'Unités de contenance' },
  { type: 'ingredient_category', label: "Catégories d'ingrédients" },
  { type: 'recipe_type', label: 'Types de recettes' },
];

export function TaxonomyManager() {
  const [activeTab, setActiveTab] = useState(TABS[0].type);
  const current = TABS.find((t) => t.type === activeTab);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Taxonomies</h2>
      <div role="tablist" className="tabs tabs-bordered mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.type}
            role="tab"
            className={`tab ${activeTab === tab.type ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.type)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <TaxonomyList type={current.type} title={current.label} />
    </div>
  );
}
