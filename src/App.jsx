import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Schedule from '@/pages/Schedule';
import Manage from '@/pages/Manage';
import FarmerView from '@/pages/FarmerView';

function App() {
  return (
    <Router>
      <Routes>
        {/* Dispatcher views (with sidebar) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Schedule />} />
          <Route path="/manage" element={<Manage />} />
        </Route>

        {/* Farmer view (no sidebar, standalone) */}
        <Route path="/farm/:farmId" element={<FarmerView />} />
      </Routes>
    </Router>
  );
}

export default App;
