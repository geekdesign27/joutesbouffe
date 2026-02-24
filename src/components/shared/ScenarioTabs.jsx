const SCENARIOS = [
  { key: 'pessimistic', label: 'Pessimiste' },
  { key: 'realistic', label: 'Réaliste' },
  { key: 'optimistic', label: 'Optimiste' },
];

export function ScenarioTabs({ active, onChange }) {
  return (
    <div className="tabs tabs-boxed">
      {SCENARIOS.map((s) => (
        <button
          key={s.key}
          className={`tab ${active === s.key ? 'tab-active' : ''}`}
          onClick={() => onChange(s.key)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
