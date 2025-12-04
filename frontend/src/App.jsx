import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ActiveNumbers from './pages/ActiveNumbers';
import GHLIntegration from './pages/GHLIntegration';
import BulkPurchase from './pages/BulkPurchase';
import Analytics from './pages/Analytics';
import SetterPerformance from './pages/SetterPerformance';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/bulk-purchase" replace />} />
          <Route path="bulk-purchase" element={<BulkPurchase />} />
          <Route path="numbers" element={<ActiveNumbers />} />
          <Route path="ghl" element={<GHLIntegration />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="setters" element={<SetterPerformance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;