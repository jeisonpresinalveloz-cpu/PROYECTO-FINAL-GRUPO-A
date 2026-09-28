// ==========================================
// ARCHIVO: pages/MedicoDashboard.jsx
// ==========================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MedicoDashboard.css';

const MedicoDashboard = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Borra el token y los datos del usuario
    navigate('/'); // Lo devuelve al Login
  };
  
  // Leemos el nombre dinámico directamente del navegador
  const userName = localStorage.getItem('userName') || 'Doctor';
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchMisDatos = async () => {
      try {
        // Buscamos los datos específicos de este médico en la BD
        const response = await axios.get(`http://localhost:5000/api/medicos/${userId}`);
        setHorarios(response.data.horarios || []);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar la agenda:', error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchMisDatos();
    }
  }, [userId]);

  return (
    <div className="medico-dashboard-container">
      <div className="medico-header">
        <h1>Panel del Médico</h1>
        <p>Bienvenido, {userName}. Esta es la vista principal de tu Agenda.</p>
      </div>

      <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>

      <div className="agenda-card">
        <h2 className="agenda-title">📅 Mis Horarios de Atención Asignados</h2>
        
        {loading ? (
          <p className="loading-text">Cargando horarios...</p>
        ) : horarios.length > 0 ? (
          horarios.map((horario) => (
            <div className="horario-row" key={horario._id || Math.random()}>
              <span className="horario-dia">{horario.dia}</span>
              <span>{horario.horaInicio} - {horario.horaFin}</span>
            </div>
          ))
        ) : (
          <p className="empty-schedule-text">
            Aún no tienes horarios configurados. Contacta al Administrador.
          </p>
        )}
      </div>
    </div>
  );
};

export default MedicoDashboard;