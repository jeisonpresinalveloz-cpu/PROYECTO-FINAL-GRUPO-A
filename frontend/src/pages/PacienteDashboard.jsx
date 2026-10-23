import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import './PacienteDashboard.css';

const PacienteDashboard = () => {
  const [tab, setTab] = useState('up');
  const [citas, setCitas] = useState([]);
  const [confirmId, setConfirmId] = useState(null); 
  const [razonCancelacion, setRazonCancelacion] = useState(''); // NUEVO: Estado para guardar la razón
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // --- Estados de los Modales ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResultadosModalOpen, setIsResultadosModalOpen] = useState(false);
  
  // --- Estados del Formulario de Citas ---
  const [medicoId, setMedicoId] = useState('');
  const [diaPreferido, setDiaPreferido] = useState(''); 
  const [motivo, setMotivo] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || '',
    phone: '',
    bloodType: '',
    allergies: ''
  });

  const [settingsData, setSettingsData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: true
  });

  const [resultadosLab, setResultadosLab] = useState([]);
  const [medicosDisponibles, setMedicosDisponibles] = useState([]);

  const userName = localStorage.getItem('userName') || 'Paciente';
  const userId = localStorage.getItem('userId');
  const getInitials = (name) => name.slice(0, 2).toUpperCase();
  const primerNombre = userName.split(' ')[0];

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users?role=medico`);
        const medicosActivos = res.data.filter(med => med.agendaActiva !== false);
        setMedicosDisponibles(medicosActivos);
      } catch (error) {
        console.error("Error al cargar la lista de médicos:", error);
      }
    };
    fetchMedicos();
  }, []);

  const fetchCitas = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/citas/paciente/${userId}`);
      setCitas(res.data);
    } catch (error) {
      console.log("Aún no hay ruta de citas o no hay citas creadas.", error);
    }
  };

  useEffect(() => {
    if (userId) fetchCitas();
  }, [userId]);

  useEffect(() => {
    const fetchResultados = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/resultados/paciente/${userId}`);
        setResultadosLab(res.data);
      } catch (error) {
        console.error("Error al cargar los resultados clínicos:", error);
      }
    };
    fetchResultados();
  }, [userId]);

  const handleMedicoChange = (e) => {
    setMedicoId(e.target.value);
    setDiaPreferido(''); 
    setMensaje({texto: '', tipo: ''});
  };

  const handleAgendarCita = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/citas/crear`, {
        pacienteId: userId,
        medicoId,
        dia: diaPreferido, 
        horario: 'Por definir', 
        motivo
      });

      setMensaje({ texto: 'Cita solicitada exitosamente.', tipo: 'success' });
      fetchCitas(); 
      
      setTimeout(() => {
        setIsModalOpen(false);
        setMedicoId(''); 
        setDiaPreferido('');
        setMotivo(''); 
        setMensaje({ texto: '', tipo: ''});
      }, 2000);
    } catch (error) {
      setMensaje({ texto: error.response?.data?.mensaje || 'Error al solicitar la cita.', tipo: 'error' });
      console.error(error);
    }
  };

const handleCancelarCita = async (id) => {
    if (!razonCancelacion.trim()) {
      alert("Por favor, ingresa un motivo para cancelar la cita.");
      return;
    }

    try {
      // AQUÍ: Enviamos la razón en el cuerpo de la petición (el segundo argumento de axios.put)
      await axios.put(`${import.meta.env.VITE_API_URL}/citas/${id}/cancelar`, {
        razonCancelacion: `Cancelada por el paciente: ${razonCancelacion}`
      });
      
      setCitas(citas.map(c => c._id === id ? { ...c, estado: 'cancelada', razonCancelacion: `Cancelada por el paciente: ${razonCancelacion}` } : c));
      setConfirmId(null);
      setRazonCancelacion(''); 
    } catch (error) {
      console.error("Error al cancelar la cita", error);
      alert("Hubo un error al cancelar. Intenta de nuevo.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleRequestPasswordChange = async () => { 
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/olvide-password`, { email });
      alert('Se ha enviado un enlace seguro a tu correo para cambiar la contraseña.');
      setIsSettingsModalOpen(false);
    } catch (error) {
      alert('Hubo un error al solicitar el cambio de contraseña. Intenta de nuevo.');
      console.error(error);
    }
  };

  const handleSaveProfile = async () => { 
    try {
      if (!userId) {
        alert('Error: No se encontró la sesión del usuario.');
        return;
      }
      await axios.put(`${import.meta.env.VITE_API_URL}/users/profile`, {
        userId,
        name: profileData.name,
        phone: profileData.phone,
        bloodType: profileData.bloodType,
        allergies: profileData.allergies
      });
      localStorage.setItem('userName', profileData.name);
      alert('Perfil actualizado exitosamente.');
      setIsProfileModalOpen(false); 
    } catch (error) {
      alert(error.response?.data?.mensaje || 'Error al guardar los cambios del perfil');
      console.error(error);
    }
  };

  const obtenerFechaYHoraParaMostrar = (cita) => {
    if (cita.estado === 'pendiente') {
      return { 
        dia: '--', 
        textoSecundario: 'PEND', 
        textoCompleto: 'Esperando confirmación del médico' 
      };
    }
    
    if (cita.estado === 'cancelada') {
      return { 
        dia: '--', 
        textoSecundario: 'CANC', 
        textoCompleto: 'Cancelada' // Simplificado
      };
    }

    if (cita.estado === 'atendida') {
      if (!cita.dia || cita.dia === 'Por definir') {
        const fechaCreacion = new Date(cita.createdAt);
        const diaNum = fechaCreacion.getDate().toString().padStart(2, '0');
        const mesStr = fechaCreacion.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
        
        return { 
          dia: diaNum, 
          textoSecundario: mesStr, 
          textoCompleto: `${fechaCreacion.toLocaleDateString()} · Consulta rápida` 
        };
      }
    }

    const diaExtract = cita.dia && cita.dia !== 'Por definir' && cita.dia.includes('-') ? cita.dia.split('-')[2] : '--';
    return { 
      dia: diaExtract, 
      textoSecundario: 'DÍA', 
      textoCompleto: `${cita.dia !== 'Por definir' ? cita.dia : 'Fecha pendiente'} · ${cita.horario !== 'Por definir' ? cita.horario : 'Hora pendiente'}` 
    };
  };

  const citasFiltradas = citas.filter(c => {
    if (tab === 'up') return c.estado === 'pendiente' || c.estado === 'confirmada';
    return c.estado === 'atendida' || c.estado === 'cancelada';
  });

  const proximaCita = citas.find(c => c.estado === 'confirmada') || citas.find(c => c.estado === 'pendiente');
  const proximaCitaDatos = proximaCita ? obtenerFechaYHoraParaMostrar(proximaCita) : null;

  const resultadosCombinados = [
    ...resultadosLab,
    ...citas.filter(c => c.estado === 'atendida' && c.diagnostico).map(c => ({
      _id: c._id,
      tipo: 'Resumen de Consulta Médica',
      medicoId: c.medicoId,
      fecha: c.dia !== 'Por definir' && c.dia ? c.dia : 'Consulta Reciente',
      estado: 'Listo',
      observaciones: `Motivo: ${c.motivo}. Diagnóstico: ${c.diagnostico}.`,
      receta: c.receta 
    }))
  ];

  const handleDownloadPDF = (res) => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Plaza De La Salud", 105, 20, null, null, "center");
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Dirección: Av. Ortega y Gasset, Santo Domingo", 105, 28, null, null, "center");
    doc.text("Teléfono: 809-565-7477", 105, 34, null, null, "center");
    
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40); 

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(res.tipo === 'Resumen de Consulta Médica' ? 'RECETA Y RESUMEN MÉDICO' : 'REPORTE DE LABORATORIO', 105, 50, null, null, "center");

    doc.setFontSize(11);
    doc.text("Datos del Paciente:", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${userName}`, 20, 72);
    doc.text(`Fecha del Reporte: ${res.fecha}`, 20, 78);

    doc.setFont("helvetica", "bold");
    doc.text("Datos del Especialista:", 120, 65);
    doc.setFont("helvetica", "normal");
    doc.text(`Médico: ${res.medicoId?.name || 'Médico de turno'}`, 120, 72);
    
    doc.setLineWidth(0.2);
    doc.line(20, 85, 190, 85);

    doc.setFont("helvetica", "bold");
    doc.text("Observaciones Clínicas:", 20, 95);
    
    doc.setFont("helvetica", "normal");
    const splitObservaciones = doc.splitTextToSize(res.observaciones || 'Sin observaciones.', 170);
    doc.text(splitObservaciones, 20, 102);

    let yPos = 102 + (splitObservaciones.length * 7) + 10;

    if (res.receta && res.receta.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Receta Médica Indicada:", 20, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      res.receta.forEach((med, index) => {
        doc.text(`• ${med.nombre} - ${med.dosis}`, 25, yPos);
        yPos += 6;
        doc.text(`  Frecuencia: ${med.frecuencia}`, 25, yPos);
        yPos += 8;
      });
    }

    doc.line(75, 250, 135, 250);
    doc.setFont("helvetica", "normal");
    doc.text(`Firma del Dr. ${res.medicoId?.name?.split(' ')[0] || ''}`, 105, 255, null, null, "center");
    
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Este documento fue generado automáticamente por Mi Salud (Plaza De La Salud).", 105, 280, null, null, "center");

    const fileName = res.tipo === 'Resumen de Consulta Médica' ? `Receta_${userName.split(' ')[0]}.pdf` : `Laboratorio_${res.tipo.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="mi-salud-app">
      <div className="wrap">
        
        {/* --- HEADER --- */}
        <header className="top">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4.5l2.5-6 4 12 2.5-6H22"/></svg>
            </span>
            <div><strong>Mi Salud</strong><small>Plaza De La Salud</small></div>
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
                      <span>{localStorage.getItem('userEmail') || 'paciente@correo.com'}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <ul className="dropdown-menu-list">
                    <li onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }}>
                      <span className="menu-icon">👤</span> Mi perfil
                    </li>
                    <li onClick={() => { setIsSettingsModalOpen(true); setIsDropdownOpen(false); }}>
                      <span className="menu-icon">⚙️</span> Configuración
                    </li>
                    <div className="dropdown-divider"></div>
                    <li onClick={handleLogout} className="logout-item"><span className="menu-icon">🚪</span> Cerrar sesión</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="greet">
          <p className="eyebrow">Hoy</p>
          <h1>Hola, {primerNombre}</h1>
          <p className="lede">Tienes {citasFiltradas.length} citas en esta sección.</p>
        </section>

        <div className="grid-top">
          {/* Tarjeta Destacada */}
          <section className="hero">
            <p className="eyebrow">Tu próxima cita</p>
            {proximaCita ? (
              <>
                <div className="next">
                  <div className="cal"><span>{proximaCitaDatos.dia}</span><small>{proximaCitaDatos.textoSecundario}</small></div>
                  <div>
                    <h2 className="next-doc">{proximaCita.medicoId?.name || 'Médico'}</h2>
                    <p className="next-meta">{proximaCitaDatos.textoCompleto} · {proximaCita.motivo}</p>
                  </div>
                </div>
                <button className="btn btn-primary" style={{alignSelf: 'start', marginTop: '10px'}} onClick={() => setIsModalOpen(true)}>
                  + Agendar Nueva Cita
                </button>
              </>
            ) : (
              <>
                <div className="next">
                  <div className="cal"><span>–</span><small></small></div>
                  <div>
                    <h2 className="next-doc">Sin citas próximas</h2>
                    <p className="next-meta">Agenda tu próxima consulta cuando lo necesites.</p>
                  </div>
                </div>
                <button className="btn btn-primary" style={{alignSelf: 'start', marginTop: '10px'}} onClick={() => setIsModalOpen(true)}>
                  + Agendar Nueva Cita
                </button>
              </>
            )}
          </section>

          {/* Accesos Rápidos */}
          <section className="panel">
            <h2 id="quick-title">Accesos rápidos</h2>
            <div className="tiles" style={{marginTop: '14px'}}>
              <button className="tile" onClick={() => setIsModalOpen(true)}>
                <span className="tile-ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg></span>
                <strong>Agendar cita</strong><small>Especialista y motivo</small>
              </button>
              
              <button className="tile" onClick={() => setIsResultadosModalOpen(true)}>
                <span className="tile-ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M7 3h7l5 5v13H7z M14 3v5h5"/></svg></span>
                <strong>Resultados</strong><small>Revisa tus análisis y recetas</small>
              </button>
            </div>
          </section>
        </div>

        <div className="grid-bottom">
          {/* Lista de Citas */}
          <section className="panel">
            <div className="panel-head">
              <h2>Mis citas</h2>
              <div className="seg">
                <button onClick={() => setTab('up')} aria-pressed={tab === 'up'}>Próximas</button>
                <button onClick={() => setTab('past')} aria-pressed={tab === 'past'}>Historial</button>
              </div>
            </div>
            
            <ol className="list">
              {citasFiltradas.map(cita => {
                const datosFormateados = obtenerFechaYHoraParaMostrar(cita);

                return (
                  <li key={cita._id} className="row" data-status={cita.estado}>
                    <div className="cal"><span>{datosFormateados.dia}</span><small>{datosFormateados.textoSecundario}</small></div>
                    <div style={{ width: '100%' }}>
                      <div className="row-top">
                        <strong>{cita.motivo}</strong>
                        <span className="pill">{cita.estado.toUpperCase()}</span>
                      </div>
                      <p className="meta">{cita.medicoId?.name || 'Médico'} · {datosFormateados.textoCompleto}</p>
                      
                      {cita.estado === 'atendida' && cita.diagnostico && (
                        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--surface-2)', borderRadius: '8px', border: `1px solid var(--line)` }}>
                          <strong style={{ color: 'var(--accent)', fontSize: '13px' }}>📋 Diagnóstico:</strong>
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--ink)' }}>{cita.diagnostico}</p>
                        </div>
                      )}

                      {/* NUEVO: Mostrar la razón si está cancelada */}
                      {cita.estado === 'cancelada' && cita.razonCancelacion && (
                        <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: 'rgba(255, 91, 91, 0.05)', borderRadius: '8px', borderLeft: '3px solid var(--danger)' }}>
                          <p style={{ margin: '0', fontSize: '13px', color: 'var(--danger)' }}><strong>Motivo:</strong> {cita.razonCancelacion}</p>
                        </div>
                      )}

                      <div className="row-foot" style={{ marginTop: '12px' }}>
                        <span className="hint">
                          {cita.estado === 'pendiente' ? 'Esperando al doctor...' : cita.dia && cita.dia !== 'Por definir' && !cita.dia.includes('-') ? `Día solicitado: ${cita.dia}` : ''}
                        </span>
                        <div className="row-actions">
                          {confirmId === cita._id ? (
                            <div className="confirm-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', width: '100%' }}>
                              <span style={{ alignSelf: 'flex-start', fontSize: '13px', color: 'var(--muted)' }}>¿Por qué deseas cancelar la cita?</span>
                              
                              {/* NUEVO: Input para la razón */}
                              <input 
                                type="text" 
                                placeholder="Ej. Ya me siento mejor / Problema de horario..." 
                                value={razonCancelacion}
                                onChange={(e) => setRazonCancelacion(e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)' }}
                              />
                              
                              <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-end' }}>
                                <button className="btn btn-ghost" onClick={() => { setConfirmId(null); setRazonCancelacion(''); }}>Volver</button>
                                <button className="btn btn-danger" onClick={() => handleCancelarCita(cita._id)}>Confirmar Cancelación</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {cita.estado !== 'atendida' && cita.estado !== 'cancelada' && (
                                <button className="btn btn-ghost" onClick={() => setConfirmId(cita._id)}>Cancelar</button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            {citasFiltradas.length === 0 && <p className="empty">No tienes citas en esta sección.</p>}
          </section>

          {/* Médico de Cabecera */}
          <aside className="side">
             <section className="panel doctor">
              <h2>Mi médico de cabecera</h2>
              <div className="doc-card" style={{marginTop:'14px'}}>
                <span className="doc-av">LH</span>
                <div><strong>Dra. Lucía Herrera</strong><small>Medicina general</small></div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* --- MODAL PARA AGENDAR CITA --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setIsModalOpen(false)}>✕</button>
            <h2>Agendar Nueva Cita</h2>
            <p className="hint" style={{marginBottom: '20px'}}>Selecciona el especialista y tu día de preferencia.</p>

            {mensaje.texto && <div className={`modal-alert ${mensaje.tipo}`}>{mensaje.texto}</div>}

            <form onSubmit={handleAgendarCita} className="agendar-form">
              <div className="form-group">
                <label>Especialista</label>
                <select value={medicoId} onChange={handleMedicoChange} required>
                  <option value="">Selecciona un médico...</option>
                  {medicosDisponibles.length > 0 ? (
                    medicosDisponibles.map(med => (
                      <option key={med._id} value={med._id}>
                        {med.name} - {med.especialidad || 'Sin especialidad'}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Cargando médicos disponibles...</option>
                  )}
                </select>
              </div>

              {medicoId && medicosDisponibles.find(m => m._id === medicoId)?.horarios?.length > 0 && (
                <div className="form-group">
                  <label>Día de preferencia</label>
                  <select value={diaPreferido} onChange={(e) => setDiaPreferido(e.target.value)} required>
                    <option value="">Selecciona qué día prefieres asistir...</option>
                    {medicosDisponibles.find(m => m._id === medicoId).horarios.map((h, index) => (
                      <option key={index} value={h.dia}>
                        {h.dia} (Horario de atención: {h.horaInicio} a {h.horaFin})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label>Motivo de la consulta</label>
                <input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. Dolor de cabeza frecuente..." required />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Solicitar Cita</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE RESULTADOS --- */}
      {isResultadosModalOpen && (
        <div className="modal-overlay" onClick={() => setIsResultadosModalOpen(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setIsResultadosModalOpen(false)}>✕</button>
            <h2>Mis Resultados Clínicos</h2>
            <p className="hint" style={{marginBottom: '20px'}}>Revisa tus análisis de laboratorio y las recetas de tus últimas consultas.</p>

            <div className="resultados-list">
              {resultadosCombinados.length > 0 ? (
                resultadosCombinados.map(res => (
                  <div key={res._id} className="resultado-card">
                    <div className="resultado-header">
                      <div>
                        <strong>{res.tipo}</strong>
                        <small>Indicado por: {res.medicoId?.name || 'Dr. Asignado'} - {res.fecha}</small>
                      </div>
                      <span className={`pill ${res.estado === 'Listo' ? 'pill-success' : 'pill-warning'}`}>
                        {res.estado.toUpperCase()}
                      </span>
                    </div>
                    
                    {res.estado === 'Listo' && res.observaciones && (
                      <div className="resultado-body">
                        <strong className="obs-title">
                          {res.tipo === 'Resumen de Consulta Médica' ? 'Detalles de la consulta:' : 'Observaciones de laboratorio:'}
                        </strong>
                        <p>{res.observaciones}</p>

                        {res.receta && res.receta.length > 0 && (
                          <div style={{ marginTop: '12px', borderTop: '1px dashed var(--line)', paddingTop: '12px' }}>
                            <strong style={{ color: 'var(--muted)', fontSize: '13px' }}>💊 Receta Médica Indicada:</strong>
                            <ul style={{ margin: '6px 0 0 0', paddingLeft: '16px', fontSize: '13px' }}>
                              {res.receta.map((med, i) => (
                                <li key={i} style={{marginBottom: '4px'}}>
                                  <strong>{med.nombre}</strong> - {med.dosis} <br />
                                  <span style={{color: 'var(--muted)'}}>Frecuencia: {med.frecuencia}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <button className="btn btn-ghost btn-download" onClick={() => handleDownloadPDF(res)}>
                          📥 Descargar PDF
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty">No tienes resultados clínicos registrados en el sistema.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE MI PERFIL --- */}
      {isProfileModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
          <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setIsProfileModalOpen(false)}>✕</button>
            <div className="modal-header-flex">
               <div className="dropdown-avatar modal-avatar-large">{getInitials(profileData.name)}</div>
               <div>
                 <h2>Mi Perfil Médico</h2>
                 <p className="hint">Actualiza tu información personal y clínica básica.</p>
               </div>
            </div>

            <form className="agendar-form" style={{ marginTop: '24px' }}>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input type="email" value={profileData.email} disabled style={{opacity: 0.7, cursor: 'not-allowed'}} />
                </div>
                <div className="form-group">
                  <label>Teléfono de Contacto</label>
                  <input type="tel" placeholder="Ej. 809-555-0199" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Sangre</label>
                  <select value={profileData.bloodType} onChange={(e) => setProfileData({...profileData, bloodType: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    <option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                    <option value="A-">A-</option><option value="O-">O-</option><option value="B-">B-</option><option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Alergias Conocidas</label>
                  <input type="text" placeholder="Ej. Penicilina, Ninguna..." value={profileData.allergies} onChange={(e) => setProfileData({...profileData, allergies: e.target.value})} />
                </div>
              </div>
              
              <button type="button" className="btn btn-primary" style={{width: '100%', marginTop: '16px'}} onClick={handleSaveProfile}>
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIGURACIÓN --- */}
      {isSettingsModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setIsSettingsModalOpen(false)}>✕</button>
            <h2>Configuración de la Cuenta</h2>
            <p className="hint" style={{marginBottom: '24px'}}>Gestiona tus preferencias y notificaciones.</p>

            <div className="settings-section">
              <h3>Notificaciones</h3>
              <div className="setting-row">
                <div>
                  <strong>Correos Electrónicos</strong>
                  <span className="hint-block">Recibir recordatorios de citas y resultados.</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settingsData.emailNotifications} onChange={(e) => setSettingsData({...settingsData, emailNotifications: e.target.checked})} />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-row">
                <div>
                  <strong>Mensajes SMS</strong>
                  <span className="hint-block">Alertas urgentes a tu número de contacto.</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settingsData.smsNotifications} onChange={(e) => setSettingsData({...settingsData, smsNotifications: e.target.checked})} />
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
    </div>
  );
};

export default PacienteDashboard;