import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PacienteDashboard from './pages/PacienteDashboard';
import MedicoDashboard from './pages/MedicoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ResetPassword from './pages/ResetPassword';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/paciente/buscar" element={<PacienteDashboard />} />
        <Route path="/medico/agenda" element={<MedicoDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;