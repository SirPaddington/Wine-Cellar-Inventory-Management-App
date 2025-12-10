import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useCellarStore } from './store/cellarStore';
import { useEffect } from 'react';

import InventoryPage from './pages/InventoryPage';
import ConfigurationPage from './pages/ConfigurationPage';
import { ConsumptionPage } from './pages/ConsumptionPage';

import DashboardPage from './pages/DashboardPage';

// Inventory replaced by page import
import Cellar3D from './pages/Cellar3D';

function App() {
  const initializeDefaults = useCellarStore((state) => state.initializeDefaults);

  useEffect(() => {
    initializeDefaults();
  }, [initializeDefaults]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/consumption" element={<ConsumptionPage />} />
          <Route path="/cellar" element={<Cellar3D />} />
          <Route path="/configuration" element={<ConfigurationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
