import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
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

  // ESTADO NUEVO: Para los widgets (Inician en 0 hasta conectar al backend)
  const [stats, setStats] = useState({
    doctoresRegistrados: 0,
    citasTotales: 0,
    citasPendientes: 0,
    citasCanceladas: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/stats');
        setStats(res.data);
      } catch (error) {
        console.error("Error cargando las estadísticas:", error);
      }
    };

    fetchStats();
  }, []);
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

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
    <div className="admin-dashboard-container">
      


      <div className="admin-header-top">
        <div>
          <h1>Panel de Administración General</h1>
          <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Monitoreo del sistema y gestión del personal médico</p>
        </div>
        <button className="btn-logout-admin" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>



      <div className="admin-widgets-grid">
        <div className="admin-widget w-doctores">
          <div className="widget-data">
            <h3>Doctores Activos</h3>
            <p>{stats.doctoresRegistrados}</p>
          </div>
          <div className="widget-icono">👨‍⚕️</div>
        </div>

        <div className="admin-widget w-totales">
          <div className="widget-data">
            <h3>Citas Globales</h3>
            <p>{stats.citasTotales}</p>
          </div>
          <div className="widget-icono">📅</div>
        </div>

        <div className="admin-widget w-pendientes">
          <div className="widget-data">
            <h3>Citas por Aprobar</h3>
            <p>{stats.citasPendientes}</p>
          </div>
          <div className="widget-icono">⏳</div>
        </div>

        <div className="admin-widget w-canceladas">
          <div className="widget-data">
            <h3>Citas Canceladas</h3>
            <p>{stats.citasCanceladas}</p>
          </div>
          <div className="widget-icono">❌</div>
        </div>
      </div>



      <div className="admin-card">
        
        <div className="admin-header">
          <div className="admin-icon"></div>
          <h2 className="admin-title">Registro Interno de Personal Médico</h2>
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