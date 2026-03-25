import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Schedule from '@/pages/Schedule';
import Manage from '@/pages/Manage';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Schedule />} />
          <Route path="/manage" element={<Manage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
