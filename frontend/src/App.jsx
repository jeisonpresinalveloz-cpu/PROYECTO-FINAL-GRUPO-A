import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PacienteDashboard from './pages/PacienteDashboard';
import MedicoDashboard from './pages/MedicoDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/paciente/buscar" element={<PacienteDashboard />} />
        <Route path="/medico/agenda" element={<MedicoDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;