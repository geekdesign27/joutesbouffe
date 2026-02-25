import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import AccessGate from './components/auth/AccessGate';
import ConfigPage from './pages/ConfigPage';
import SuppliersPage from './pages/SuppliersPage';
import IngredientsPage from './pages/IngredientsPage';
import RecipesPage from './pages/RecipesPage';
import ProfilesPage from './pages/ProfilesPage';
import FixedCostsPage from './pages/FixedCostsPage';
import TaxonomiesPage from './pages/TaxonomiesPage';

import DashboardPage from './pages/DashboardPage';
import PdfImportPage from './pages/PdfImportPage';

function App() {
  const [accessGranted, setAccessGranted] = useState(
    () => localStorage.getItem('access_granted') === 'true'
  );

  if (!accessGranted) {
    return <AccessGate onGranted={() => setAccessGranted(true)} />;
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/fournisseurs" element={<SuppliersPage />} />
          <Route path="/ingredients" element={<IngredientsPage />} />
          <Route path="/recettes" element={<RecipesPage />} />
          <Route path="/profils" element={<ProfilesPage />} />
          <Route path="/couts-fixes" element={<FixedCostsPage />} />
          <Route path="/taxonomies" element={<TaxonomiesPage />} />
          <Route path="/projections" element={<Navigate to="/profils" replace />} />
          <Route path="/import-pdf" element={<PdfImportPage />} />
        </Routes>
      </AppLayout>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
