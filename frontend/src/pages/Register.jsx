import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Petición al backend para registrar al paciente
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role: 'paciente' // Forzamos el rol por defecto
      });
      
      alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
      navigate('/'); // Lo enviamos al login
      
    } catch (error) {
      setError('Error al crear la cuenta. Verifica los datos.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">✚</div>
          <h2 className="login-title">Registro de Pacientes</h2>
          <p className="login-subtitle">Crea tu cuenta en La Plaza De La Salud</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ej. María Pérez"
              required 
            />
          </div>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="maria@correo.com"
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
          
          <button type="submit" className="login-button">Crear Cuenta</button>
        </form>
        
        <div style={{ marginTop: '20px', fontSize: '14px' }}>
          ¿Ya tienes cuenta? <Link to="/" style={{ color: '#00acc1', textDecoration: 'none', fontWeight: 'bold' }}>Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
};
export default Register;