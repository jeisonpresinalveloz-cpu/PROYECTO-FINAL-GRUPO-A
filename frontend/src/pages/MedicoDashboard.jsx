import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './MedicoDashboard.css';

const MedicoDashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = localStorage.getItem('userName') || 'Doctor';
  const getInitials = (name) => name.slice(0, 2).toUpperCase();
  const apellido = userName.split(' ').length > 1 ? userName.split(' ')[1] : userName;
  const doctorId = localStorage.getItem('userId');

  // --- ESTADOS DE LA AGENDA Y CITAS ---
  const [agendaActiva, setAgendaActiva] = useState(true);
  const [citas, setCitas] = useState([]);
  
  // NUEVO: Estados para declinar cita
  const [declineId, setDeclineId] = useState(null);
  const [razonDeclinacion, setRazonDeclinacion] = useState('');
  
  // --- RESULTADOS PENDIENTES DESDE MONGODB ---
  const [resultados, setResultados] = useState([]);

  // --- ESTADOS DE MODALES ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isExpedienteModalOpen, setIsExpedienteModalOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    name: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || '',
    phone: '',
    especialidad: '', 
    exequatur: '' 
  });

  const [settingsData, setSettingsData] = useState({
    emailNotifications: true,
    smsAlerts: true
  });

  const [isConsultaModalOpen, setIsConsultaModalOpen] = useState(false);
  const [pacienteActivo, setPacienteActivo] = useState(null); 
  const [historialPaciente, setHistorialPaciente] = useState([]); 
  
  const [consultaData, setConsultaData] = useState({
    motivo: '',
    sintomas: '',
    diagnostico: '',
    receta: [] 
  });

  const [nuevoMedicamento, setNuevoMedicamento] = useState({
    nombre: '',
    dosis: '',
    frecuencia: ''
  });

  // --- OBTENER DATOS DEL MÉDICO AL CARGAR ---
  useEffect(() => {
    const fetchMisDatos = async () => {
      if (!doctorId) return;

      try {
        const resPerfil = await axios.get(`${import.meta.env.VITE_API_URL}/users/${doctorId}`);
        if (resPerfil.data) {
          if (resPerfil.data.agendaActiva !== undefined) {
             setAgendaActiva(resPerfil.data.agendaActiva);
          }
        }

        const resCitas = await axios.get(`${import.meta.env.VITE_API_URL}/citas/medico/${doctorId}`);
        setCitas(resCitas.data);

        const resResultados = await axios.get(`${import.meta.env.VITE_API_URL}/resultados/medico/${doctorId}`);
        const resultadosPendientes = resResultados.data.filter(r => r.estado === 'Pendiente');
        setResultados(resultadosPendientes);
        
      } catch (error) {
        console.error("Error al cargar los datos iniciales:", error);
      }
    };

    fetchMisDatos();
  }, [doctorId]);

  // --- ACCIONES GENERALES ---
  const handleRequestPasswordChange = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/olvide-password`, { email });
      alert('Enlace de seguridad enviado a tu correo corporativo.');
      setIsSettingsModalOpen(false);
    } catch (error) {
      alert('Error al solicitar cambio de contraseña.');
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!doctorId) {
        alert('Error: Sesión no encontrada.');
        return;
      }
      await axios.put(`${import.meta.env.VITE_API_URL}/users/profile`, {
        userId: doctorId,
        name: profileData.name,
        phone: profileData.phone,
        especialidad: profileData.especialidad,
        exequatur: profileData.exequatur
      });

      localStorage.setItem('userName', profileData.name);
      alert('Perfil profesional actualizado correctamente.');
      setIsProfileModalOpen(false);
    } catch (error) {
      alert('Error al guardar el perfil profesional.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // --- 1. PAUSAR / REANUDAR AGENDA ---
  const handleToggleAgenda = async () => {
    try {
      const nuevoEstado = !agendaActiva;
      setAgendaActiva(nuevoEstado);
      setIsDropdownOpen(false);
      
      await axios.put(`${import.meta.env.VITE_API_URL}/users/profile`, {
        userId: doctorId,
        agendaActiva: nuevoEstado
      });
      
      alert(nuevoEstado ? 'Agenda reanudada. Ya puedes recibir pacientes.' : 'Agenda pausada. No recibirás nuevas solicitudes de citas.');
    } catch (error) {
      alert('Error al cambiar el estado de la agenda.');
      setAgendaActiva(!agendaActiva); 
    }
  };

  // --- 2. MARCAR RESULTADO COMO REVISADO ---
  const marcarResultadoRevisado = async (idResultadoMongo) => {
    try {
      setResultados(resultados.filter(r => r._id !== idResultadoMongo));
      
      await axios.put(`${import.meta.env.VITE_API_URL}/resultados/${idResultadoMongo}/estado`, { 
        estado: 'Listo' 
      });
      
    } catch (error) {
      console.error('Error al actualizar el resultado:', error);
      alert('Hubo un error al marcar el resultado como revisado. Se revertirá el cambio.');
    }
  };

  const cambiarEstadoCita = async (idCitaMongo, nuevoEstado, datosExtra = {}) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/citas/${idCitaMongo}/estado`, { 
        estado: nuevoEstado,
        ...datosExtra 
      });
      
      setCitas(citas.map(c => c._id === idCitaMongo ? { ...c, estado: nuevoEstado, ...datosExtra } : c));
    } catch (error) {
      console.error('Error al actualizar estado en BD.', error);
      alert('Error de conexión al guardar la cita en la base de datos.');
    }
  };

  // NUEVO: Función para manejar la declinación con motivo
  const handleDeclinarCita = async (idCita) => {
    if (!razonDeclinacion.trim()) {
      alert("Por favor, ingresa un motivo para declinar la cita.");
      return;
    }
    
    // Aprovechamos el método existente pero le pasamos el datosExtra con la razón
    await cambiarEstadoCita(idCita, 'cancelada', { 
      razonCancelacion: `Declinada por el médico: ${razonDeclinacion}` 
    });
    
    setDeclineId(null);
    setRazonDeclinacion('');
  };

  // --- 3. VER EXPEDIENTE CLÍNICO ---
  const handleVerExpediente = async (pacienteId_Mongo) => {
    if (!pacienteId_Mongo) {
      alert("Error: Paciente no válido.");
      return;
    }
    
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/citas/paciente/${pacienteId_Mongo}`);
      const citasAtendidas = res.data.filter(c => c.estado === 'atendida' && c.diagnostico);
      setHistorialPaciente(citasAtendidas);
      setIsExpedienteModalOpen(true);
    } catch (error) {
      console.error("Error al cargar expediente:", error);
      alert("Hubo un error al cargar el expediente clínico del paciente.");
    }
  };

  // --- MÓDULO DE CONSULTA ---
  const handleAbrirConsulta = (cita) => {
    const nombrePaciente = cita.pacienteId?.name || 'Paciente sin nombre';
    const edadPaciente = cita.pacienteId?.age || '--';

    setPacienteActivo({
      _id: cita._id,
      pacienteId: cita.pacienteId?._id, 
      name: nombrePaciente,
      age: edadPaciente,
      reason: cita.motivo
    });
    
    setIsConsultaModalOpen(true);
    cambiarEstadoCita(cita._id, 'en_consulta');
  };

  const handleAgregarMedicamento = () => {
    if (!nuevoMedicamento.nombre || !nuevoMedicamento.dosis) return;
    setConsultaData({
      ...consultaData,
      receta: [...consultaData.receta, nuevoMedicamento]
    });
    setNuevoMedicamento({ nombre: '', dosis: '', frecuencia: '' });
  };

  const handleEliminarMedicamento = (index) => {
    const nuevaReceta = consultaData.receta.filter((_, i) => i !== index);
    setConsultaData({ ...consultaData, receta: nuevaReceta });
  };

  const handleTerminarConsulta = () => {
    cambiarEstadoCita(pacienteActivo._id, 'atendida', {
      diagnostico: consultaData.diagnostico,
      sintomas: consultaData.sintomas,
      receta: consultaData.receta
    }); 
    
    setIsConsultaModalOpen(false);
    setPacienteActivo(null);
    setConsultaData({ motivo: '', sintomas: '', diagnostico: '', receta: [] });
  };

  // --- CÁLCULOS DINÁMICOS ---
  const pacientesHoy = citas.filter(c => c.estado !== 'cancelada').length;
  const atendidos = citas.filter(c => c.estado === 'atendida').length;
  const enSalaOconsulta = citas.filter(c => c.estado === 'en_sala' || c.estado === 'en_consulta').length;
  const finalizados = citas.filter(c => c.estado === 'atendida' || c.estado === 'cancelada').length;

  const pacienteActual = citas.find(c => c.estado === 'en_consulta') 
    || citas.find(c => c.estado === 'en_sala') 
    || citas.find(c => c.estado === 'confirmada')
    || citas.find(c => c.estado === 'pendiente');

  const getCssStatus = (estado) => {
    switch(estado) {
      case 'en_sala': return 'wait';
      case 'en_consulta': return 'live';
      case 'atendida': return 'done';
      case 'cancelada': return 'cancelled';
      default: return 'pending';
    }
  };

  const getDisplayTime = (cita) => {
    if (cita.estado === 'pendiente') return 'Nuevo';
    const h = cita.horario || cita.hora;
    return (h === 'Por definir') ? '--:--' : h;
  };

  return (
    <div className={`medico-plaza-app ${!agendaActiva ? 'agenda-pausada' : ''}`}>
      
      {/* CINTA DE ADVERTENCIA DE AGENDA PAUSADA */}
      {!agendaActiva && (
        <div style={{ backgroundColor: 'var(--warning)', color: '#000', textAlign: 'center', padding: '8px', fontWeight: 'bold', zIndex: 10 }}>
          ⚠️ TU AGENDA ESTÁ PAUSADA. NO ESTÁS RECIBIENDO NUEVAS CITAS.
        </div>
      )}

      <div className="wrap">
        <header className="top">
          <div className="brand">
            <span className="brand-mark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4.5l2.5-6 4 12 2.5-6H22"/></svg>
            </span>
            <div><strong>Panel Médico</strong><small>Plaza De La Salud · Consultorio 1</small></div>
          </div>
          
          <div className="top-actions" ref={dropdownRef}>
            <div style={{ position: 'relative' }}>
              <span className="avatar" onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ cursor: 'pointer' }}>
                {getInitials(userName)}
              </span>
              
              {isDropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{getInitials(userName)}</div>
                    <div className="dropdown-user-info">
                      <strong>{userName}</strong>
                      <span>{localStorage.getItem('userEmail') || 'doctor@plazasalud.com'}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <ul className="dropdown-menu-list">
                    <li onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }}>
                      <span className="menu-icon">👨‍⚕️</span> Mi perfil profesional
                    </li>
                    <li onClick={() => { setIsSettingsModalOpen(true); setIsDropdownOpen(false); }}>
                      <span className="menu-icon">⚙️</span> Configuración
                    </li>
                    <div className="dropdown-divider"></div>
                    <li onClick={handleToggleAgenda}>
                      <span className="menu-icon">{agendaActiva ? '⏸️' : '▶️'}</span> 
                      {agendaActiva ? 'Pausar mi agenda' : 'Reanudar mi agenda'}
                    </li>
                    <li onClick={handleLogout} className="logout-item"><span className="menu-icon">🚪</span> Cerrar sesión</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="greet">
          <p className="eyebrow">Hoy</p>
          <h1>Buenos días, Dr. {apellido}</h1>
          <p className="lede">Te quedan {pacientesHoy - atendidos} pacientes por atender hoy.</p>
        </section>

        <section className="stats">
          <article className="stat" data-k="total"><span className="stat-label">Pacientes hoy</span><strong>{pacientesHoy}</strong></article>
          <article className="stat" data-k="done"><span className="stat-label">Atendidos</span><strong>{atendidos}</strong></article>
          <article className="stat" data-k="room"><span className="stat-label">En sala o consulta</span><strong>{enSalaOconsulta}</strong></article>
          <article className="stat" data-k="res"><span className="stat-label">Resultados por revisar</span><strong>{resultados.length}</strong></article>
        </section>

        <div className="layout">
          <div className="main">
            {/* HÉROE DEL PACIENTE ACTUAL */}
            <section className="hero">
              {!pacienteActual ? (
                <div className="empty-hero">
                  <p className="eyebrow">Consulta actual</p>
                  <h2 style={{ marginTop: '10px' }}>Sin pacientes en espera</h2>
                  <p className="hero-note" style={{ marginTop: '8px' }}>Cuando un paciente llegue a sala aparecerá aquí.</p>
                </div>
              ) : (
                <>
                  <p className="eyebrow">{pacienteActual.estado === 'en_consulta' ? 'En consulta ahora' : 'Próximo paciente'}</p>
                  <h2>{pacienteActual.pacienteId?.name || 'Paciente'}</h2>
                  <div className="hero-meta">
                    <span className="chip">{getDisplayTime(pacienteActual)}</span>
                    <span className="chip">{pacienteActual.pacienteId?.age || '--'} años</span>
                    <span className="chip">{pacienteActual.motivo}</span>
                  </div>
                  <div className="actions">
                    {pacienteActual.estado === 'en_consulta' ? (
                      <button className="btn btn-primary" onClick={() => handleAbrirConsulta(pacienteActual)}>Continuar consulta</button>
                    ) : (
                      <button className="btn btn-primary" onClick={() => handleAbrirConsulta(pacienteActual)}>Iniciar consulta</button>
                    )}
                    <button className="btn" onClick={() => handleVerExpediente(pacienteActual.pacienteId?._id)}>Ver expediente</button>
                  </div>
                </>
              )}
            </section>

            {/* LISTA COMPLETA DE PACIENTES */}
            <section className="panel">
              <div className="panel-head">
                <h2>Pacientes de hoy</h2>
                <span className="hint">{finalizados} de {citas.length} finalizados</span>
              </div>
              <ol className="list">
                {citas.map(cita => (
                  <li key={cita._id} className="row" data-status={getCssStatus(cita.estado)}>
                    <span className="time" style={{ fontSize: cita.estado === 'pendiente' ? '12px' : '16px' }}>
                      {getDisplayTime(cita)}
                    </span>
                    <div style={{ width: '100%' }}>
                      <div className="row-top">
                        <strong>{cita.pacienteId?.name || 'Paciente'}</strong>
                        <span className="pill">
                          {cita.estado === 'pendiente' && 'Pendiente'}
                          {cita.estado === 'confirmada' && 'Por llegar'}
                          {cita.estado === 'en_sala' && 'En sala'}
                          {cita.estado === 'en_consulta' && 'En consulta'}
                          {cita.estado === 'atendida' && 'Atendido'}
                          {cita.estado === 'cancelada' && 'No asistió / Declinada'}
                        </span>
                      </div>
                      <p className="meta">{cita.motivo} · {cita.pacienteId?.age || '--'} años</p>
                      
                      {/* NUEVO: Mostrar la razón si está cancelada/declinada */}
                      {cita.estado === 'cancelada' && cita.razonCancelacion && (
                        <div style={{ marginTop: '8px', padding: '6px 10px', backgroundColor: 'rgba(255, 91, 91, 0.05)', borderRadius: '6px', borderLeft: '3px solid var(--danger)' }}>
                          <p style={{ margin: '0', fontSize: '13px', color: 'var(--danger)' }}><strong>Motivo:</strong> {cita.razonCancelacion}</p>
                        </div>
                      )}

                      <div className="row-foot" style={{ marginTop: '12px' }}>
                        <span className="hint">
                          {cita.dia && cita.dia !== 'Por definir' && !cita.dia.includes('-') && cita.estado === 'pendiente' ? `Día preferido: ${cita.dia}` : ''}
                        </span>
                        
                        <div className="row-actions">
                          {cita.estado === 'pendiente' && (
                            <div style={{ width: '100%' }}>
                              {declineId === cita._id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', width: '100%' }}>
                                  <span style={{ alignSelf: 'flex-start', fontSize: '13px', color: 'var(--danger)' }}>¿Motivo para declinar al paciente?</span>
                                  
                                  <input 
                                    type="text" 
                                    placeholder="Ej. Fuera de horario / Especialidad incorrecta..." 
                                    value={razonDeclinacion}
                                    onChange={(e) => setRazonDeclinacion(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)' }}
                                  />
                                  
                                  <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-ghost" onClick={() => { setDeclineId(null); setRazonDeclinacion(''); }}>Volver</button>
                                    <button className="btn btn-danger" onClick={() => handleDeclinarCita(cita._id)}>Confirmar</button>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button className="btn btn-primary" onClick={() => cambiarEstadoCita(cita._id, 'confirmada')}>Aceptar</button>
                                  <button className="btn btn-ghost" onClick={() => setDeclineId(cita._id)} style={{ color: 'var(--danger)' }}>Declinar</button>
                                </div>
                              )}
                            </div>
                          )}

                          {cita.estado === 'confirmada' && (
                            <button className="btn" onClick={() => cambiarEstadoCita(cita._id, 'en_sala')}>Llamar a sala</button>
                          )}
                          
                          {cita.estado === 'en_sala' && <button className="btn btn-primary" onClick={() => handleAbrirConsulta(cita)}>Iniciar consulta</button>}
                          {cita.estado === 'en_consulta' && <button className="btn btn-primary" onClick={() => handleAbrirConsulta(cita)}>Continuar</button>}
                        </div>

                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="side">
            <section className="panel">
              <h2>Resultados por revisar</h2>
              <ul className="res" style={{ marginTop: '14px' }}>
                {resultados.map(res => (
                  <li key={res._id}>
                    <div><strong>{res.tipo}</strong><small>{res.pacienteId?.name || 'Paciente'}</small></div>
                    <button className="btn" onClick={() => marcarResultadoRevisado(res._id)}>Marcar revisado</button>
                  </li>
                ))}
              </ul>
              {resultados.length === 0 && <p className="empty" style={{ marginTop: '14px' }}>No tienes resultados pendientes.</p>}
            </section>

            <section className="panel">
              <h2>Carga de la semana</h2>
              <p className="hint" style={{ marginTop: '4px' }}>Citas programadas por día.</p>
              <div className="week" style={{ marginTop: '6px' }}>
                <div className="col is-today"><b>8</b><div className="bar" style={{ height: '100%' }}></div><span>Hoy</span></div>
                <div className="col"><b>5</b><div className="bar" style={{ height: '60%' }}></div><span>Lun</span></div>
                <div className="col"><b>7</b><div className="bar" style={{ height: '85%' }}></div><span>Mar</span></div>
                <div className="col"><b>4</b><div className="bar" style={{ height: '50%' }}></div><span>Mié</span></div>
                <div className="col"><b>0</b><div className="bar" style={{ height: '5%' }}></div><span>Jue</span></div>
              </div>
            </section>
          </aside>
        </div>
      </div>
      
      {/* --- MODAL DE PERFIL PROFESIONAL --- */}
      {isProfileModalOpen && (
        <div className="medico-modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
          <div className="medico-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setIsProfileModalOpen(false)}>✕</button>
            <div className="modal-header-flex">
               <div className="dropdown-avatar modal-avatar-large">
                 {profileData.name.substring(0, 2).toUpperCase()}
               </div>
               <div>
                 <h2>Perfil Profesional</h2>
                 <p className="hint">Actualiza tus credenciales y datos de contacto en la clínica.</p>
               </div>
            </div>

            <form className="medico-form" style={{ marginTop: '24px' }}>
              <div className="form-group">
                <label>Nombre y Título</label>
                <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} placeholder="Ej. Dr. Francisco Gómez" />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Correo Corporativo</label>
                  <input type="email" value={profileData.email} disabled style={{opacity: 0.7, cursor: 'not-allowed'}} />
                </div>
                <div className="form-group">
                  <label>Teléfono del Consultorio</label>
                  <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} placeholder="Ej. Ext. 405" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Especialidad Principal</label>
                  <input type="text" value={profileData.especialidad} onChange={(e) => setProfileData({...profileData, especialidad: e.target.value})} placeholder="Ej. Cardiología" />
                </div>
                <div className="form-group">
                  <label>Exequátur / Colegiatura</label>
                  <input type="text" value={profileData.exequatur} onChange={(e) => setProfileData({...profileData, exequatur: e.target.value})} placeholder="Ej. 12345-MED" />
                </div>
              </div>
              
              <button type="button" className="btn btn-primary" style={{width: '100%', marginTop: '16px'}} onClick={handleSaveProfile}>
                Guardar Credenciales
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIGURACIÓN --- */}
      {isSettingsModalOpen && (
        <div className="medico-modal-overlay" onClick={() => setIsSettingsModalOpen(false)}>
          <div className="medico-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setIsSettingsModalOpen(false)}>✕</button>
            <h2>Configuración del Panel</h2>
            <p className="hint" style={{marginBottom: '24px'}}>Gestiona tus notificaciones y seguridad.</p>

            <div className="settings-section">
              <h3>Alertas de Pacientes</h3>
              <div className="setting-row">
                <div>
                  <strong>Notificar llegadas</strong>
                  <span className="hint-block"> Aviso cuando un paciente pase a "En sala". </span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settingsData.emailNotifications} onChange={(e) => setSettingsData({...settingsData, emailNotifications: e.target.checked})} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-section" style={{marginTop: '24px'}}>
              <h3>Seguridad</h3>
              <button className="btn btn-ghost" style={{width: '100%', justifyContent: 'flex-start', padding: '12px', marginTop: '8px', border: '1px solid var(--line)'}} onClick={handleRequestPasswordChange}>
                Cambiar mi contraseña
              </button>
            </div>
            
            <button type="button" className="btn btn-primary" style={{width: '100%', marginTop: '32px'}} onClick={() => setIsSettingsModalOpen(false)}>Hecho</button>
          </div>
        </div>
      )}

      {/* --- MODAL PARA EXPEDIENTE CLÍNICO --- */}
      {isExpedienteModalOpen && (
        <div className="medico-modal-overlay" onClick={() => setIsExpedienteModalOpen(false)}>
          <div className="medico-modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setIsExpedienteModalOpen(false)}>✕</button>
            <h2>Expediente Médico Anterior</h2>
            <p className="hint" style={{marginBottom: '20px'}}>Historial de consultas y diagnósticos pasados de este paciente.</p>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {historialPaciente.length === 0 ? (
                <p className="empty">El paciente no tiene consultas previas registradas.</p>
              ) : (
                historialPaciente.map((citaPrevia, i) => (
                  <div key={i} style={{ border: '1px solid var(--line)', padding: '16px', borderRadius: '8px', marginBottom: '12px', backgroundColor: 'var(--surface-2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong>Fecha: {citaPrevia.dia}</strong>
                      <span className="pill">ATENDIDO</span>
                    </div>
                    <p style={{ margin: '4px 0' }}><strong>Motivo:</strong> {citaPrevia.motivo}</p>
                    <p style={{ margin: '4px 0' }}><strong>Síntomas:</strong> {citaPrevia.sintomas || 'No detallados'}</p>
                    <p style={{ margin: '4px 0', color: 'var(--accent)' }}><strong>Diagnóstico:</strong> {citaPrevia.diagnostico}</p>
                    
                    {citaPrevia.receta && citaPrevia.receta.length > 0 && (
                      <div style={{ marginTop: '12px', borderTop: '1px dashed var(--line)', paddingTop: '8px' }}>
                        <strong>Receta indicada:</strong>
                        <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
                          {citaPrevia.receta.map((med, j) => (
                            <li key={j}>{med.nombre} - {med.dosis} ({med.frecuencia})</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONSULTA ACTIVA --- */}
      {isConsultaModalOpen && pacienteActivo && (
        <div className="consulta-modal-overlay">
          <div className="consulta-modal-content">
            
            <div className="consulta-header">
              <div>
                <h2>Consulta Activa: {pacienteActivo.name}</h2>
                <p>Edad: {pacienteActivo.age} años | Motivo previo: {pacienteActivo.reason}</p>
              </div>
              
              <div className="consulta-alertas">
                <span className="alerta-item sangre">Sangre: O+</span>
                <span className="alerta-item alergia">Alergias: Penicilina</span>
              </div>
            </div>

            <div className="consulta-body">
              <div className="consulta-col-izq">
                <h3>Evolución Clínica (SOAP)</h3>
                
                <div className="form-group">
                  <label>Motivo de la Consulta</label>
                  <input type="text" value={consultaData.motivo} onChange={e => setConsultaData({...consultaData, motivo: e.target.value})} placeholder="Ej. Dolor de cabeza frecuente" />
                </div>
                
                <div className="form-group">
                  <label>Síntomas y Evaluación</label>
                  <textarea rows="4" value={consultaData.sintomas} onChange={e => setConsultaData({...consultaData, sintomas: e.target.value})} placeholder="Describe los síntomas del paciente..."></textarea>
                </div>

                <div className="form-group">
                  <label>Diagnóstico Preliminar</label>
                  <input type="text" value={consultaData.diagnostico} onChange={e => setConsultaData({...consultaData, diagnostico: e.target.value})} placeholder="Ej. Migraña tensional" />
                </div>
              </div>

              <div className="consulta-col-der">
                <h3>Receta Médica</h3>
                
                <div className="receta-inputs">
                  <input type="text" placeholder="Medicamento (Ej. Paracetamol)" value={nuevoMedicamento.nombre} onChange={e => setNuevoMedicamento({...nuevoMedicamento, nombre: e.target.value})} />
                  <div className="receta-row">
                    <input type="text" placeholder="Dosis (Ej. 500mg)" value={nuevoMedicamento.dosis} onChange={e => setNuevoMedicamento({...nuevoMedicamento, dosis: e.target.value})} />
                    <input type="text" placeholder="Frecuencia (Ej. Cada 8 hrs)" value={nuevoMedicamento.frecuencia} onChange={e => setNuevoMedicamento({...nuevoMedicamento, frecuencia: e.target.value})} />
                  </div>
                  <button type="button" onClick={handleAgregarMedicamento} className="btn-agregar-med">
                    + Añadir a la receta
                  </button>
                </div>

                <div className="receta-lista">
                  {consultaData.receta.length === 0 ? (
                    <p className="receta-vacia">No hay medicamentos en la receta.</p>
                  ) : (
                    <ul>
                      {consultaData.receta.map((med, index) => (
                        <li key={index}>
                          <div>
                            <strong>{med.nombre}</strong> - {med.dosis}
                            <br/><small>{med.frecuencia}</small>
                          </div>
                          <button type="button" onClick={() => handleEliminarMedicamento(index)}>✕</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="consulta-footer">
              <button type="button" className="btn-cancelar" onClick={() => setIsConsultaModalOpen(false)}>Pausar</button>
              <button type="button" className="btn-finalizar" onClick={handleTerminarConsulta}>Terminar Consulta y Guardar</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MedicoDashboard;