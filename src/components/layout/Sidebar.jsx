import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Store, Carrot, UtensilsCrossed,
  Wallet, LayoutDashboard,
  Settings, Users, Tag, FileText,
  ChevronDown,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Synthèse',
    defaultOpen: true,
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Données',
    defaultOpen: true,
    items: [
      { to: '/fournisseurs', label: 'Fournisseurs', icon: Store },
      { to: '/ingredients', label: 'Ingrédients', icon: Carrot },
      { to: '/recettes', label: 'Recettes', icon: UtensilsCrossed },
    ],
  },
  {
    label: 'Budget',
    defaultOpen: true,
    items: [
      { to: '/profils', label: 'Profils & Projections', icon: Users },
      { to: '/couts-fixes', label: 'Coûts fixes', icon: Wallet },
    ],
  },
  {
    label: 'Configuration',
    defaultOpen: false,
    items: [
      { to: '/config', label: 'Configuration', icon: Settings },
      { to: '/taxonomies', label: 'Taxonomies', icon: Tag },
      { to: '/import-pdf', label: 'Import PDF', icon: FileText },
    ],
  },
];

function NavGroup({ group, onNavClick }) {
  const [open, setOpen] = useState(group.defaultOpen);

  return (
    <li>
      <button
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-base-content/50 hover:text-base-content/80"
        onClick={() => setOpen(!open)}
      >
        {group.label}
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </button>
      {open && (
        <ul>
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    isActive ? 'active font-semibold' : ''
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export function Sidebar({ onNavClick }) {
  return (
    <aside className="flex flex-col h-full bg-base-100">
      <div className="p-4 border-b border-base-300">
        <h1 className="text-xl font-bold text-primary">CateringCalc</h1>
        <p className="text-xs text-base-content/60">CP Moncor</p>
      </div>
      <ul className="menu menu-md flex-1 p-2 gap-0">
        {NAV_GROUPS.map((group) => (
          <NavGroup key={group.label} group={group} onNavClick={onNavClick} />
        ))}
      </ul>
    </aside>
  );
}
