import { useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

const PAGE_TITLES = {
  '/config': 'Configuration de la manifestation',
  '/fournisseurs': 'Gestion des fournisseurs',
  '/ingredients': 'Gestion des ingrédients',
  '/recettes': 'Gestion des recettes',
  '/profils': 'Profils & Projections',
  '/couts-fixes': 'Coûts fixes',
  '/': 'Dashboard de synthèse',
  '/taxonomies': 'Taxonomies',
  '/import-pdf': 'Import de factures PDF',
};

export function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const title = PAGE_TITLES[pathname] || 'CateringCalc';

  return (
    <header className="navbar bg-base-100 border-b border-base-300 px-4 gap-2">
      <button
        className="btn btn-ghost btn-square lg:hidden"
        onClick={onMenuClick}
        aria-label="Ouvrir le menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h2 className="text-lg font-semibold flex-1">{title}</h2>
      <button
        className="btn btn-ghost btn-square"
        onClick={toggleTheme}
        aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {isDark ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </header>
  );
}
