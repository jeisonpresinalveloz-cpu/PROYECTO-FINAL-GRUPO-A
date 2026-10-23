import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Mantiene la estructura general (fondo, tarjeta)
import './Register.css'; // Nuevos estilos específicos separados

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const navigate = useNavigate();

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isStrong = hasLength && hasUpper && hasNumber;

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!isStrong) {
      setMensaje({ texto: 'Por favor, cumple con los requisitos de la contraseña.', tipo: 'error' });
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        name,
        email,
        password,
        role: 'paciente'
      });
      setMensaje({ texto: 'Cuenta creada exitosamente. Redirigiendo...', tipo: 'success' });
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setMensaje({ texto: error.response?.data?.mensaje || 'Error al registrar la cuenta.', tipo: 'error' });
    }
  };

  return (
    <div className="login-page-container">
      <video autoPlay loop muted playsInline className="video-background">
        <source src="/hospital-bg.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay"></div>

      <div className="login-card-dark register-card-override">
        <div className="login-header-dark">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--accent-primary)" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          <h2>Crear Cuenta</h2>
          <p>Únete a Plaza De La Salud</p>
        </div>

        {mensaje.texto && (
          <div className={`alerta-dark ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleRegister} className="form-dark">
          <div className="input-group-dark">
            <label>Nombre Completo</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. María Pérez" required />
          </div>

          <div className="input-group-dark">
            <label>Correo Electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ejemplo@correo.com" required />
          </div>
          
          <div className="input-group-dark">
            <label>Contraseña Segura</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Escribe tu contraseña" required />
            
            <div className="password-meter">
              <span className={`meter-req ${hasLength ? 'valid' : 'invalid'}`}>
                {hasLength ? '✓' : '○'} Mínimo 8 caracteres
              </span>
              <span className={`meter-req ${hasUpper ? 'valid' : 'invalid'}`}>
                {hasUpper ? '✓' : '○'} Al menos una letra mayúscula
              </span>
              <span className={`meter-req ${hasNumber ? 'valid' : 'invalid'}`}>
                {hasNumber ? '✓' : '○'} Al menos un número
              </span>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn-submit-dark btn-register-submit" 
            disabled={!isStrong}
          >
            Registrarme
          </button>
        </form>

        <div className="login-footer-dark register-footer-override">
          <p>¿Ya tienes cuenta? <Link to="/">Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;