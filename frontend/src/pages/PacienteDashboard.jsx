// ==========================================
// ARCHIVO: pages/PacienteDashboard.jsx
// HISTORIA: HU04 - Catálogo y Filtros de Médicos
// ==========================================
import { useState, useEffect } from 'react';
import axios from 'axios';
import './PacienteDashboard.css';

const PacienteDashboard = () => {
  const [medicos, setMedicos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Cargar la lista de médicos desde el backend al iniciar la pantalla
  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/medicos');
        setMedicos(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar el catálogo:', error);
        setLoading(false);
      }
    };
    fetchMedicos();
  }, []);

  // 2. Lógica del Filtro de Búsqueda
  const medicosFiltrados = medicos.filter((medico) => {
    // Compatibilidad con datos antiguos (specialty) y nuevos (especialidad)
    const especialidad = medico.especialidad || medico.specialty || 'Sin especialidad';
    return especialidad.toLowerCase().includes(filtro.toLowerCase());
  });

  if (loading) {
    return <div className="loading-message">Cargando catálogo médico...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Catálogo de Especialistas</h1>
        <p>Encuentra a tu médico y revisa sus horarios de atención</p>
      </div>

      <div className="filter-section">
        <input 
          type="text" 
          className="filter-input"
          placeholder="🔍 Filtrar por especialidad (Ej. Pediatría, Cardiología)..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <div className="medicos-grid">
        {medicosFiltrados.length > 0 ? (
          medicosFiltrados.map((medico) => (
            <div className="medico-card" key={medico._id}>
              <h3 className="medico-name">{medico.name}</h3>
              <span className="medico-specialty">
                {medico.especialidad || medico.specialty || 'Medicina General'}
              </span>

              <div className="horarios-container">
                <div className="horarios-title">Horarios de Atención</div>
                {medico.horarios && medico.horarios.length > 0 ? (
                  medico.horarios.map((horario) => (
                    <div className="horario-item" key={horario._id || Math.random()}>
                      <strong>{horario.dia}</strong>
                      <span>{horario.horaInicio} - {horario.horaFin}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#95a5a6', fontSize: '14px', fontStyle: 'italic' }}>
                    Horarios aún no configurados
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No se encontraron médicos para la especialidad "{filtro}".
          </div>
        )}
      </div>
    </div>
  );
};

export default PacienteDashboard;