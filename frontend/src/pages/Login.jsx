import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Herramienta para redirigir de página

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      localStorage.setItem('token', response.data.token);
      
      
      
      const userRole = response.data.user?.role || response.data.role;

      if (userRole === 'medico') {
        navigate('/medico/agenda');
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        // Si es paciente o cualquier otro, va a su panel
        navigate('/paciente/buscar');
      }
      
    } catch (error) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">✚</div>
          <h2 className="login-title">Plaza De La Salud</h2>
          <p className="login-subtitle">Portal de Pacientes y Personal Médico</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Introduzca su correo electrónico"
              required 
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="login-button">Ingresar al Sistema</button>
        </form>

        {/* HU01: Opción para ir a registrarse si no tiene cuenta */}
        <div className="footer-text">
        ¿No tienes cuenta? <Link to="/register" className="footer-link">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
};
export default Login;