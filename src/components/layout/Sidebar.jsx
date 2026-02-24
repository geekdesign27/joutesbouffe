import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/config', label: 'Configuration', icon: '⚙️' },
  { to: '/fournisseurs', label: 'Fournisseurs', icon: '🏪' },
  { to: '/import-pdf', label: 'Import PDF', icon: '📄' },
  { to: '/ingredients', label: 'Ingrédients', icon: '🥕' },
  { to: '/recettes', label: 'Recettes', icon: '🍽️' },
  { to: '/profils', label: 'Profils', icon: '👥' },
  { to: '/couts-fixes', label: 'Coûts fixes', icon: '💰' },
  { to: '/taxonomies', label: 'Taxonomies', icon: '🏷️' },
  { to: '/projections', label: 'Projections', icon: '📊' },
  { to: '/dashboard', label: 'Dashboard', icon: '📈' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-base-100 border-r border-base-300 flex flex-col">
      <div className="p-4 border-b border-base-300">
        <h1 className="text-xl font-bold text-primary">CateringCalc</h1>
        <p className="text-xs text-base-content/60">CP Moncor</p>
      </div>
      <ul className="menu menu-md flex-1 p-2">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'active font-semibold' : ''
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
