// ==========================================
// ARCHIVO: pages/AdminDashboard.jsx
// HISTORIA: HU03 - Catálogo de médicos y horarios
// ==========================================
import { useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css'; // Conexión estricta a la hoja de estilos externa

const AdminDashboard = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  
  // Estado dinámico para los horarios del médico
  const [horarios, setHorarios] = useState([
    { dia: 'Lunes', horaInicio: '08:00', horaFin: '12:00' }
  ]);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Funciones para manejar los horarios dinámicamente
  const handleAddHorario = () => {
    setHorarios([...horarios, { dia: 'Lunes', horaInicio: '08:00', horaFin: '12:00' }]);
  };

  const handleRemoveHorario = (index) => {
    const nuevosHorarios = horarios.filter((_, i) => i !== index);
    setHorarios(nuevosHorarios);
  };

  const handleHorarioChange = (index, campo, valor) => {
    const nuevosHorarios = [...horarios];
    nuevosHorarios[index][campo] = valor;
    setHorarios(nuevosHorarios);
  };

  const handleRegisterDoctor = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role: 'medico',
        especialidad,
        horarios
      });
      
      setSuccess('Perfil de médico y sus horarios guardados exitosamente.');
      setName(''); setEmail(''); setPassword(''); setEspecialidad('');
      setHorarios([{ dia: 'Lunes', horaInicio: '08:00', horaFin: '12:00' }]);
      
    } catch (error) {
      setError(error.response?.data?.mensaje || 'Error al registrar al personal médico.');
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        
        <div className="admin-header">
          <div className="admin-icon">⚙️</div>
          <h2 className="admin-title">Panel de Administración</h2>
          <p className="admin-subtitle">Registro Interno de Personal Médico</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleRegisterDoctor}>
          <div className="form-group">
            <label>Nombre del Médico</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ej. Dra. Pérez"
              required 
            />
          </div>
          
          <div className="form-row">
            <div className="form-group-half">
              <label>Correo Institucional</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group-half">
              <label>Contraseña Temporal</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Especialidad</label>
            <input 
              type="text" 
              value={especialidad} 
              onChange={(e) => setEspecialidad(e.target.value)} 
              placeholder="Ej. Pediatría, Cardiología..."
              required 
            />
          </div>
          
          {/* Sección dinámica de horarios */}
          <div className="schedule-container">
            <div className="schedule-title">Configuración de Horarios de Atención</div>
            {horarios.map((horario, index) => (
              <div key={index} className="schedule-row">
                <select 
                  className="schedule-input"
                  value={horario.dia} 
                  onChange={(e) => handleHorarioChange(index, 'dia', e.target.value)}
                >
                  <option value="Lunes">Lunes</option>
                  <option value="Martes">Martes</option>
                  <option value="Miércoles">Miércoles</option>
                  <option value="Jueves">Jueves</option>
                  <option value="Viernes">Viernes</option>
                  <option value="Sábado">Sábado</option>
                </select>
                
                <input 
                  type="time" 
                  className="schedule-input"
                  value={horario.horaInicio} 
                  onChange={(e) => handleHorarioChange(index, 'horaInicio', e.target.value)}
                  required
                />
                <span>a</span>
                <input 
                  type="time" 
                  className="schedule-input"
                  value={horario.horaFin} 
                  onChange={(e) => handleHorarioChange(index, 'horaFin', e.target.value)}
                  required
                />
                
                {horarios.length > 1 && (
                  <button type="button" className="btn-remove" onClick={() => handleRemoveHorario(index)}>
                    X
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-add" onClick={handleAddHorario}>
              + Agregar otro día/horario
            </button>
          </div>
          
          <button type="submit" className="admin-button">
            Guardar Perfil Médico
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;