import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Estados para el Modal de Recuperación
  const [modalResetAbierto, setModalResetAbierto] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensajeReset, setMensajeReset] = useState({ texto: '', tipo: '' });

const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      // Actualizamos la lectura de los datos basándonos en la respuesta real del backend
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data._id);
      localStorage.setItem('userName', res.data.name);
      localStorage.setItem('userRole', res.data.role);

    // Redirección basada en el rol directamente desde res.data
      if (res.data.role === 'admin') navigate('/admin/dashboard');
      else if (res.data.role === 'medico') navigate('/medico/agenda');
      else navigate('/paciente/buscar');
      
    } catch (error) {
      setMensaje({ texto: error.response?.data?.mensaje || 'Error al iniciar sesión', tipo: 'error' });
    }
  };

  // Función para manejar el restablecimiento
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', { 
        email: resetEmail, 
        nuevaPassword 
      });
      setMensajeReset({ texto: res.data.mensaje, tipo: 'success' });
      setTimeout(() => {
        setModalResetAbierto(false);
        setMensajeReset({ texto: '', tipo: '' });
        setResetEmail('');
        setNuevaPassword('');
      }, 3000);
    } catch (error) {
      setMensajeReset({ texto: error.response?.data?.mensaje || 'Error al restablecer', tipo: 'error' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
  <div className="login-header">
          <svg 
            width="75" 
            height="75" 
            viewBox="0 0 24 24" 
            fill="#00a8a8" 
            xmlns="http://www.w3.org/2000/svg" 
            style={{ marginBottom: '10px', filter: 'drop-shadow(0px 4px 6px rgba(0, 168, 168, 0.3))' }}
          >
            <path d="M19 10h-4V6c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v4H5c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h4v4c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-4h4c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2z"/>
          </svg>
          <h2>Plaza De La Salud</h2>
          <p>Portal de Pacientes y Personal Médico</p>
        </div>
        
        {mensaje.texto && <div className={`alert-mensaje alert-${mensaje.tipo}`}>{mensaje.texto}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="Introduzca su correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">Ingresar al Sistema</button>
        </form>

        <div className="login-footer">
          <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
          <button 
            className="btn-forgot-password" 
            onClick={() => setModalResetAbierto(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      {/* MODAL DE RESTABLECIMIENTO */}
      {modalResetAbierto && (
        <div className="modal-overlay">
          <div className="modal-content modal-reset-content">
            <div className="modal-header">
              <h2>Recuperar Contraseña</h2>
              <button className="btn-close" onClick={() => setModalResetAbierto(false)}>&times;</button>
            </div>
            
            {mensajeReset.texto && <div className={`alert-mensaje alert-${mensajeReset.tipo}`}>{mensajeReset.texto}</div>}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>Tu Correo Electrónico</label>
                <input 
                  type="email" 
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input 
                  type="password" 
                  required
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                />
              </div>
              <button type="submit" className="btn-primary btn-reset-submit">
                Actualizar Contraseña
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;