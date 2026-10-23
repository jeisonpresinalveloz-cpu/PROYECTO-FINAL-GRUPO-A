import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PacienteDashboard from './pages/PacienteDashboard';
import MedicoDashboard from './pages/MedicoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute'; // <-- Importamos el protector

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* --- Rutas Protegidas --- */}
        <Route 
          path="/paciente/buscar" 
          element={
            <ProtectedRoute allowedRoles={['paciente']}>
              <PacienteDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/medico/agenda" 
          element={
            <ProtectedRoute allowedRoles={['medico']}>
              <MedicoDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Ruta comodín (si escriben una URL que no existe, los manda al Login) */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;