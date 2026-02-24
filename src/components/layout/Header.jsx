import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/config': 'Configuration de la manifestation',
  '/fournisseurs': 'Gestion des fournisseurs',
  '/ingredients': 'Gestion des ingrédients',
  '/recettes': 'Gestion des recettes',
  '/profils': 'Profils de consommateurs',
  '/couts-fixes': 'Coûts fixes',
  '/projections': 'Projections par scénario',
  '/dashboard': 'Dashboard de synthèse',
};

export function Header() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'CateringCalc';

  return (
    <header className="navbar bg-base-100 border-b border-base-300 px-6">
      <h2 className="text-lg font-semibold">{title}</h2>
    </header>
  );
}
