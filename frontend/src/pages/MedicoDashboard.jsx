import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MedicoDashboard.css';

const MedicoDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Doctor';
  const userId = localStorage.getItem('userId');

  const [citasAgendadas, setCitasAgendadas] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Función para cargar los pacientes (La sacamos del useEffect para poder reutilizarla)
  const fetchMiAgenda = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/citas/medico/${userId}`);
      setCitasAgendadas(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchMiAgenda();
  }, [userId]);

  // NUEVO: Función para que el médico acepte o decline citas
  const cambiarEstadoCita = async (citaId, nuevoEstado) => {
    const accion = nuevoEstado === 'confirmada' ? 'aceptar' : 'declinar';
    if(window.confirm(`¿Estás seguro de que deseas ${accion} esta cita?`)) {
      try {
        await axios.put(`http://localhost:5000/api/citas/estado/${citaId}`, {
          estado: nuevoEstado
        });
        fetchMiAgenda(); // Recargamos la lista para ver el cambio de color al instante
      } catch (error) {
        console.error(`Error al ${accion} la cita:`, error);
      }
    }
  };

  return (
    <div className="medico-dashboard-container">
      <div className="header-top">
        <div className="medico-header header-text-container">
          <h1>Panel Clínico del Médico</h1>
          <p>Bienvenido, {userName}. Esta es tu lista de pacientes agendados.</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
      </div>

      <div className="agenda-card">
        <h2 className="agenda-title">📋 Mis Pacientes para Hoy / Próximos Días</h2>
        
        {loading ? (
          <p className="loading-text">Cargando agenda...</p>
        ) : citasAgendadas.length > 0 ? (
          citasAgendadas.map((cita) => (
            <div className="cita-row" key={cita._id}>
              
              <div className="cita-header">
                <span className="horario-dia">{cita.dia} a las {cita.horario}</span>
                <span className={`estado-badge estado-${cita.estado.toLowerCase()}`}>
                  {cita.estado.toUpperCase()}
                </span>
              </div>
              
              <div className="cita-paciente">
                <strong>Paciente:</strong> {cita.pacienteId ? cita.pacienteId.name : 'Paciente eliminado'}
              </div>
              
              {cita.motivo && (
                <div className="cita-motivo">
                  Motivo: "{cita.motivo}"
                </div>
              )}

              {/* NUEVO: Botones de Acción (Solo se muestran si la cita está PENDIENTE) */}
              {cita.estado === 'pendiente' && (
                <div className="acciones-medico">
                  <button 
                    className="btn-accion btn-aceptar" 
                    onClick={() => cambiarEstadoCita(cita._id, 'confirmada')}
                  >
                    Aceptar Cita
                  </button>
                  <button 
                    className="btn-accion btn-declinar" 
                    onClick={() => cambiarEstadoCita(cita._id, 'cancelada')}
                  >
                    Declinar
                  </button>
                </div>
              )}
              
            </div>
          ))
        ) : (
          <p className="empty-schedule-text">
            No tienes pacientes agendados en este momento.
          </p>
        )}
      </div>
    </div>
  );
};

export default MedicoDashboard;