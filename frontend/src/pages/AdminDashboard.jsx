import { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Reutilizamos los estilos de la clínica

const AdminDashboard = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegisterDoctor = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // Petición al backend forzando el rol de 'medico'
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role: 'medico' 
      });
      
      setSuccess('Perfil de médico creado y guardado en la base de datos.');
      // Limpiamos el formulario después de un registro exitoso
      setName('');
      setEmail('');
      setPassword('');
      
    } catch (error) {
      setError('Error al registrar al personal médico. Verifica el servidor.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '500px' }}>
        
        <div className="login-header">
          {/* Ícono de engranaje para denotar administración */}
          <div className="login-icon" style={{ backgroundColor: '#2c3e50' }}>⚙️</div>
          <h2 className="login-title">Panel de Administración</h2>
          <p className="login-subtitle">Registro Interno de Personal Médico</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && (
          <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', borderLeft: '4px solid #2e7d32' }}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleRegisterDoctor}>
          <div className="form-group">
            <label>Nombre del Médico</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ej. Dr. Roberto Sánchez"
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Correo Institucional</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="roberto.sanchez@clinica.com"
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña Temporal</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Asignar contraseña"
              required 
            />
          </div>
          
          <button type="submit" className="login-button" style={{ backgroundColor: '#2c3e50' }}>
            Registrar Perfil Médico
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default AdminDashboard;