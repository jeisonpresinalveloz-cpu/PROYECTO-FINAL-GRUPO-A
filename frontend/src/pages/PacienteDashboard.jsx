import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PacienteDashboard.css';

const PacienteDashboard = () => {
  const navigate = useNavigate();
  const pacienteId = localStorage.getItem('userId');
  
  const [medicos, setMedicos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para el Modal de Reservas
  const [modalAbierto, setModalAbierto] = useState(false);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [motivo, setMotivo] = useState('');
  
  const [bloquesDisponibles, setBloquesDisponibles] = useState([]);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [misCitas, setMisCitas] = useState([]);

  // Cerrar Sesión
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // NUEVO: Función para cargar mis citas
  const cargarMisCitas = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/citas/paciente/${pacienteId}`);
      setMisCitas(res.data);
    } catch (error) {
      console.error('Error al cargar mis citas:', error);
    }
  };

  // NUEVO: Función para cancelar una cita
  const handleCancelarCita = async (citaId) => {
    if(window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      try {
        await axios.put(`http://localhost:5000/api/citas/cancelar/${citaId}`);
        cargarMisCitas(); // Recargamos la lista para que se vea como "CANCELADA"
      } catch (error) {
        console.error('Error al cancelar:', error);
      }
    }
  };

  // Cargar catálogo de médicos Y las citas del paciente
  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/medicos');
        setMedicos(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar médicos:', error);
        setLoading(false);
      }
    };
    
    fetchMedicos();
    
    // Si tenemos un paciente logueado, traemos sus citas de inmediato
    if (pacienteId) {
      cargarMisCitas(); 
    }
    
  }, [pacienteId]); 


  // Filtro de búsqueda
  const medicosFiltrados = medicos.filter(medico => {
    const especialidad = medico.especialidad || medico.specialty || '';
    return especialidad.toLowerCase().includes(filtro.toLowerCase());
  });

  // HU05: Abrir modal y preparar datos
  const abrirModalReserva = (medico) => {
    setMedicoSeleccionado(medico);
    setDiaSeleccionado('');
    setHoraSeleccionada('');
    setBloquesDisponibles([]);
    setMensaje({ texto: '', tipo: '' });
    setModalAbierto(true);
  };

  // HU05: Generar horas y ocultar las ocupadas
  const cargarHorasDisponibles = async (dia) => {
    setDiaSeleccionado(dia);
    setHoraSeleccionada('');
    
    const horarioDia = medicoSeleccionado.horarios.find(h => h.dia === dia);
    if (!horarioDia) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/citas/ocupadas?medicoId=${medicoSeleccionado._id}&dia=${dia}`);
      const horasOcupadas = res.data;

      let horaActual = parseInt(horarioDia.horaInicio.split(':')[0]);
      const horaFin = parseInt(horarioDia.horaFin.split(':')[0]);
      
      const bloquesGenerados = [];
      while (horaActual < horaFin) {
        const formatoHora = `${horaActual < 10 ? '0' : ''}${horaActual}:00`;
        if (!horasOcupadas.includes(formatoHora)) {
          bloquesGenerados.push(formatoHora);
        }
        horaActual++;
      }
      setBloquesDisponibles(bloquesGenerados);
    } catch (error) {
      console.error("Error al consultar disponibilidad", error);
    }
  };

  // HU06: Confirmar la reserva
  const handleConfirmarReserva = async () => {
    try {
      await axios.post('http://localhost:5000/api/citas/reservar', {
        pacienteId,
        medicoId: medicoSeleccionado._id,
        dia: diaSeleccionado,
        horario: horaSeleccionada,
        motivo
      });

      setMensaje({ texto: '¡Cita confirmada exitosamente!', tipo: 'success' });
      
      // Recargamos la lista para que la nueva cita aparezca mágicamente
      cargarMisCitas(); 
      
      setTimeout(() => setModalAbierto(false), 2000);
      
    } catch (error) {
      setMensaje({ texto: error.response?.data?.mensaje || 'Error al agendar', tipo: 'error' });
    }
  };

  if (loading) return <div className="loading-message">Cargando catálogo...</div>;

  return (
    <div className="dashboard-container">
      <div className="header-top dashboard-header">
        <div className="header-text-container">
          <h1>Catálogo de Especialistas</h1>
          <p>Encuentra a tu médico y revisa sus horarios de atención</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
      </div>


      <div className="mis-citas-section">
        <h2 className="mis-citas-title">📅 Mis Próximas Citas</h2>
        {misCitas.length > 0 ? (
          <div className="citas-list">
            {misCitas.map(cita => (
              <div className="cita-paciente-card" key={cita._id}>
                
                <div className="cita-paciente-header">
                  <strong>{cita.dia} a las {cita.horario}</strong>
                  <span className={`alert-mensaje badge-pequeno alert-${cita.estado === 'cancelada' ? 'error' : 'success'}`}>
                    {cita.estado.toUpperCase()}
                  </span>
                </div>
                
                <div className="cita-paciente-info">
                  <strong>Médico:</strong> {cita.medicoId?.name} <br/>
                  <span className="cita-paciente-especialidad">
                    {cita.medicoId?.especialidad || cita.medicoId?.specialty}
                  </span>
                </div>
                
                {cita.estado !== 'cancelada' && (
                  <button className="btn-cancelar" onClick={() => handleCancelarCita(cita._id)}>
                    Cancelar Cita
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="sin-citas-text">No tienes citas agendadas.</p>
        )}
      </div>

      <div className="filter-section">
        <input 
          type="text" 
          className="filter-input"
          placeholder="🔍 Filtrar por especialidad..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <div className="medicos-grid">
        {medicosFiltrados.length > 0 ? medicosFiltrados.map((medico) => (
          <div className="medico-card" key={medico._id}>
            <h3 className="medico-name">{medico.name}</h3>
            <span className="medico-specialty">
              {medico.especialidad || medico.specialty || 'Medicina General'}
            </span>
            <div className="horarios-container">
              <div className="horarios-title">Días de Atención</div>
              {medico.horarios && medico.horarios.length > 0 ? (
                <>
                  {medico.horarios.map((h, i) => (
                    <div className="horario-item" key={i}>
                      <strong>{h.dia}</strong> <span>{h.horaInicio} - {h.horaFin}</span>
                    </div>
                  ))}
                  <button className="btn-agendar" onClick={() => abrirModalReserva(medico)}>
                    Agendar Cita
                  </button>
                </>
              ) : (
                <div className="horarios-no-configurados">Horarios no configurados</div>
              )}
            </div>
          </div>
        )) : <div className="no-results">No se encontraron médicos.</div>}
      </div>

      {/* MODAL DE RESERVA */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Agendar con {medicoSeleccionado.name}</h2>
              <button className="btn-close" onClick={() => setModalAbierto(false)}>&times;</button>
            </div>

            {mensaje.texto && (
              <div className={`alert-mensaje alert-${mensaje.tipo}`}>
                {mensaje.texto}
              </div>
            )}

            <div className="form-group">
              <label>Selecciona el Día:</label>
              <select className="form-select" value={diaSeleccionado} onChange={(e) => cargarHorasDisponibles(e.target.value)}>
                <option value="">-- Elige un día --</option>
                {medicoSeleccionado.horarios.map((h, i) => (
                  <option key={i} value={h.dia}>{h.dia} ({h.horaInicio} - {h.horaFin})</option>
                ))}
              </select>
            </div>

            {diaSeleccionado && (
              <div className="form-group">
                <label>Horarios Disponibles:</label>
                {bloquesDisponibles.length > 0 ? (
                  <div className="horas-grid">
                    {bloquesDisponibles.map((hora) => (
                      <div 
                        key={hora} 
                        className={`hora-pill ${horaSeleccionada === hora ? 'selected' : ''}`}
                        onClick={() => setHoraSeleccionada(hora)}
                      >
                        {hora}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-disponibilidad-text">No hay horarios disponibles para este día.</p>
                )}
              </div>
            )}

            {horaSeleccionada && (
              <div className="form-group">
                <label>Motivo de la consulta (Opcional):</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej. Chequeo general, dolor de cabeza..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                />
                
                <button className="btn-confirmar" onClick={handleConfirmarReserva}>
                  Confirmar Reserva a las {horaSeleccionada}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PacienteDashboard;