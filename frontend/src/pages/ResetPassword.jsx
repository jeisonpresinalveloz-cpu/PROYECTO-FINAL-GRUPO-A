import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Login.css';

const ResetPassword = () => {
  const { token } = useParams(); // Capturamos el token de la URL
  const navigate = useNavigate();
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        nuevaPassword
      });
      setMensaje({ texto: res.data.mensaje, tipo: 'success' });
      setTimeout(() => navigate('/'), 3000); // Lo mandamos al login
    } catch (error) {
      setMensaje({ texto: error.response?.data?.mensaje || 'Error al restablecer la contraseña', tipo: 'error' });
    }
  };

  return (
    <div className="login-page-container">
      <video autoPlay loop muted playsInline className="video-background"><source src="/hospital-bg.mp4" type="video/mp4" /></video>
      <div className="video-overlay"></div>
      
      <div className="login-card-dark">
        <div className="login-header-dark">
          <h2>Crear Nueva Contraseña</h2>
          <p>Ingresa una contraseña segura para tu cuenta.</p>
        </div>

        {mensaje.texto && <div className={`alerta-dark ${mensaje.tipo === 'success' ? 'success' : 'error'}`}>{mensaje.texto}</div>}

        <form onSubmit={handleSubmit} className="form-dark">
          <div className="input-group-dark">
            <label>Nueva Contraseña</label>
            <input type="password" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required />
          </div>
          <button type="submit" className="btn-submit-dark" style={{marginTop: '16px'}}>Guardar y Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;