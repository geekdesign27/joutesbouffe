import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import ConfigPage from './pages/ConfigPage';
import SuppliersPage from './pages/SuppliersPage';
import IngredientsPage from './pages/IngredientsPage';
import RecipesPage from './pages/RecipesPage';
import ProfilesPage from './pages/ProfilesPage';
import FixedCostsPage from './pages/FixedCostsPage';
import TaxonomiesPage from './pages/TaxonomiesPage';
import ProjectionsPage from './pages/ProjectionsPage';
import DashboardPage from './pages/DashboardPage';
import PdfImportPage from './pages/PdfImportPage';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/fournisseurs" element={<SuppliersPage />} />
          <Route path="/ingredients" element={<IngredientsPage />} />
          <Route path="/recettes" element={<RecipesPage />} />
          <Route path="/profils" element={<ProfilesPage />} />
          <Route path="/couts-fixes" element={<FixedCostsPage />} />
          <Route path="/taxonomies" element={<TaxonomiesPage />} />
          <Route path="/projections" element={<ProjectionsPage />} />
          <Route path="/import-pdf" element={<PdfImportPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
