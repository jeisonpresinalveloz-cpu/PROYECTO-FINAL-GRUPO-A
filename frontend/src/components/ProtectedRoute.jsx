import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole'); // 'admin', 'medico', o 'paciente'

  // 1. Si no hay token, el usuario no ha iniciado sesión (lo mandamos a la raíz '/')
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2. Si la ruta requiere un rol específico y el usuario no lo tiene
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirigir a las rutas exactas definidas en App.jsx para que no se quede atascado
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (userRole === 'medico') return <Navigate to="/medico/agenda" replace />;
    return <Navigate to="/paciente/buscar" replace />;
  }

  // 3. Si pasa las validaciones, renderizar el componente solicitado
  return children;
};

export default ProtectedRoute;