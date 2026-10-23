import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const navigate = useNavigate();

  // Estados para el Modal de Recuperar Contraseña
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMensaje, setResetMensaje] = useState({ texto: '', tipo: '' });

  // 1. Inicio de sesión tradicional
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data._id);
      localStorage.setItem('userName', res.data.name);
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('userEmail', res.data.email);

      if (res.data.role === 'admin') navigate('/admin/dashboard');
      else if (res.data.role === 'medico') navigate('/medico/agenda');
      else navigate('/paciente/buscar');
      
    } catch (error) {
      setMensaje({ texto: error.response?.data?.mensaje || 'Error al iniciar sesión', tipo: 'error' });
    }
  };

  // 2. Inicio de sesión con Google
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
          access_token: tokenResponse.access_token
        });

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data._id);
        localStorage.setItem('userName', res.data.name);
        localStorage.setItem('userRole', res.data.role);
        localStorage.setItem('userEmail', res.data.email);
        if (res.data.avatar) localStorage.setItem('userAvatar', res.data.avatar);

        if (res.data.role === 'admin') navigate('/admin/dashboard');
        else if (res.data.role === 'medico') navigate('/medico/agenda');
        else navigate('/paciente/buscar');
        
      } catch (error) {
        setMensaje({ texto: 'Error al autorizar con el servidor interno', tipo: 'error' });
      }
    },
    onError: () => {
      setMensaje({ texto: 'El inicio de sesión con Google fue cancelado.', tipo: 'error' });
    }
  });

  // Lógica para SOLICITAR el enlace de Recuperar Contraseña
  const handleOlvidePassword = async (e) => {
    e.preventDefault();
    try {
      // Apuntamos a la nueva ruta que configuramos en authRoutes.js
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/olvide-password`, {
        email: resetEmail
      });
      setResetMensaje({ texto: res.data.mensaje, tipo: 'success' });
      
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setResetMensaje({ texto: '', tipo: '' });
        setResetEmail('');
      }, 3000);
    } catch (error) {
      setResetMensaje({ texto: error.response?.data?.mensaje || 'Error al solicitar recuperación', tipo: 'error' });
    }
  };

  return (
    <div className="login-page-container">
      <video autoPlay loop muted playsInline className="video-background">
        <source src="/hospital-bg.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay"></div>

      <div className="login-card-dark">
        <div className="login-header-dark">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--accent-primary)" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 10h-4V6c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v4H5c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h4v4c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-4h4c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2z"/>
          </svg>
          <h2>Plaza De La Salud</h2>
          <p>Portal de Acceso General</p>
        </div>

        {mensaje.texto && (
          <div className={`alerta-dark ${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        <button type="button" className="btn-google" onClick={handleGoogleLogin}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="google-icon" />
          Continuar con Google
        </button>

        <div className="divider-dark">
          <span>o inicia sesión con tu correo</span>
        </div>

        <form onSubmit={handleLogin} className="form-dark">
          <div className="input-group-dark">
            <label>Correo Electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ejemplo@correo.com" required />
          </div>
          
          <div className="input-group-dark">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          
          <button type="submit" className="btn-submit-dark">Ingresar al Sistema</button>
        </form>

        <div className="login-footer-dark">
          <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
          <button type="button" className="btn-forgot-password-dark" onClick={() => setIsForgotModalOpen(true)}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      {/* MODAL DE RECUPERAR CONTRASEÑA */}
      {isForgotModalOpen && (
        <div className="modal-overlay-login" onClick={() => setIsForgotModalOpen(false)}>
          <div className="modal-content-login" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-login" onClick={() => setIsForgotModalOpen(false)}>✕</button>
            <h2 style={{color: 'var(--text-primary)', marginBottom: '8px'}}>Restablecer Contraseña</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px'}}>Ingresa el correo asociado a tu cuenta para recibir un enlace de recuperación seguro.</p>

            {resetMensaje.texto && <div className={`alerta-dark ${resetMensaje.tipo}`}>{resetMensaje.texto}</div>}

            <form onSubmit={handleOlvidePassword} className="form-dark">
              <div className="input-group-dark">
                <label>Correo Electrónico</label>
                <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="Tu correo registrado" required />
              </div>
              <button type="submit" className="btn-submit-dark">Enviar enlace de recuperación</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;