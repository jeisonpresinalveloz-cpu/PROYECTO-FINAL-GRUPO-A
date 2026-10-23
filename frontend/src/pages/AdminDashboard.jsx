import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const SERIES = [14, 18, 16, 21, 19, 12, 9, 17, 22, 20, 18, 24, 21, 15];

const AdminDashboard = () => {
  const [stats, setStats] = useState({ doctoresRegistrados: 0, citasTotales: 0, citasPendientes: 0, citasCanceladas: 0 });
  const [range, setRange] = useState(7);
  
  // --- ESTADOS DE LA BASE DE DATOS ---
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [citasLista, setCitasLista] = useState([]);
  
  const [incidents, setIncidents] = useState([
    { id: 'i1', sev: 'high', title: 'Sala 2 sin esfigmomanómetro', sub: 'Reportado por enfermería hace 40 min' },
    { id: 'i2', sev: 'mid', title: '3 pacientes sin confirmar para mañana', sub: 'Enviar recordatorio antes de las 18:00' },
    { id: 'i3', sev: 'low', title: 'Factura del seguro en revisión', sub: 'Lote de 12 consultas de la semana pasada' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [horarios, setHorarios] = useState([{ dia: 'Lunes', horaInicio: '08:00', horaFin: '12:00' }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [activeView, setActiveView] = useState('resumen');
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);

  const userName = localStorage.getItem('userName') || 'Administrador';
  const getInitials = (name) => name.slice(0, 2).toUpperCase();

  // --- OBTENER TODOS LOS DATOS DE MONGODB ---
  const fetchDashboardData = async () => {
    try {
      const resStats = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`);
      setStats(resStats.data);

      const resMedicos = await axios.get(`${import.meta.env.VITE_API_URL}/users?role=medico`);
      setMedicos(resMedicos.data);

      const resPacientes = await axios.get(`${import.meta.env.VITE_API_URL}/users?role=paciente`);
      setPacientes(resPacientes.data);

      const resCitas = await axios.get(`${import.meta.env.VITE_API_URL}/citas`);
      setCitasLista(resCitas.data);
    } catch (error) {
      console.error("Error cargando los datos del dashboard:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddHorario = () => setHorarios([...horarios, { dia: 'Lunes', horaInicio: '08:00', horaFin: '12:00' }]);
  const handleRemoveHorario = (index) => setHorarios(horarios.filter((_, i) => i !== index));
  const handleHorarioChange = (index, campo, valor) => {
    const nuevosHorarios = [...horarios];
    nuevosHorarios[index][campo] = valor;
    setHorarios(nuevosHorarios);
  };

  const handleRegisterDoctor = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { name, email, password, role: 'medico', especialidad, horarios });
      setSuccess('Médico registrado exitosamente.');
      setName(''); setEmail(''); setPassword(''); setEspecialidad('');
      setHorarios([{ dia: 'Lunes', horaInicio: '08:00', horaFin: '12:00' }]);
      fetchDashboardData();
      setTimeout(() => { setIsModalOpen(false); setSuccess(''); }, 1500);
    } catch (error) {
      setError(error.response?.data?.mensaje || 'Error al registrar al personal médico.');
    }
  };

  const handleResolve = (id) => setIncidents(incidents.filter(i => i.id !== id));
  
  const handleToggleAgendaMedico = async (medicoId, estadoActual) => {
    try {
      const nuevoEstado = !estadoActual;
      setMedicos(medicos.map(m => m._id === medicoId ? { ...m, agendaActiva: nuevoEstado } : m));
      await axios.put(`${import.meta.env.VITE_API_URL}/users/profile`, { userId: medicoId, agendaActiva: nuevoEstado });
    } catch (error) {
      alert("Error al cambiar el estado del médico.");
      fetchDashboardData();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const W = 640, H = 240, pl = 36, pr = 12, pt = 16, pb = 28, pw = W - pl - pr, ph = H - pt - pb, max = 30, n = SERIES.length;
  const pts = SERIES.map((v, i) => ({ x: pl + i * (pw / (n - 1)), y: pt + ph - (v / max) * ph, v, i }));
  const linePath = 'M' + pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L');
  const areaPath = `${linePath} L${pts[n-1].x.toFixed(1)},${pt + ph} L${pts[0].x.toFixed(1)},${pt + ph} Z`;

  return (
    <div className="admin-horizonte-app">
      <aside className="rail" aria-label="Navegación">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4.5l2.5-6 4 12 2.5-6H22"/></svg>
          </span>
          <div><strong>Administración</strong><small>Plaza De La Salud</small></div>
        </div>
        
       <nav>
          <ul className="nav">
            <li><button aria-current={activeView === 'resumen' ? 'page' : undefined} onClick={() => setActiveView('resumen')}><span className="icon">📊</span> Resumen</button></li>
            <li><button aria-current={activeView === 'citas' ? 'page' : undefined} onClick={() => setActiveView('citas')}><span className="icon">🗓️</span> Citas</button></li>
            <li><button aria-current={activeView === 'medicos' ? 'page' : undefined} onClick={() => setActiveView('medicos')}><span className="icon">👨‍⚕️</span> Médicos</button></li>
            <li><button aria-current={activeView === 'pacientes' ? 'page' : undefined} onClick={() => setActiveView('pacientes')}><span className="icon">🏥</span> Pacientes</button></li>
          </ul>
        </nav>
        
        <div className="rail-foot" onClick={() => setIsAdminSettingsOpen(true)} style={{ cursor: 'pointer', transition: 'background 0.2s' }} title="Configuración">
          <span className="avatar" aria-hidden="true">{getInitials(userName)}</span>
          <div><strong>{userName}</strong><small>Administrador</small></div>
        </div>
      </aside>

      <main className="main">
        {activeView === 'resumen' && (
          <>
            <header className="top">
              <div><p className="eyebrow">Hoy</p><h1>Resumen general</h1></div>
              <div className="top-actions">
                <div className="seg" role="group">
                  <button type="button" onClick={() => setRange(7)} aria-pressed={range === 7}>7 días</button>
                  <button type="button" onClick={() => setRange(30)} aria-pressed={range === 30}>30 días</button>
                </div>
                <button className="btn btn-primary" type="button" onClick={() => setIsModalOpen(true)}>+ Registrar Médico</button>
              </div>
            </header>

            <section className="kpis">
              <article className="kpi"><span className="kpi-label">Citas Globales</span><strong>{stats.citasTotales}</strong><span className="delta">+8% vs anterior</span></article>
              <article className="kpi"><span className="kpi-label">Doctores Activos</span><strong>{medicos.filter(m => m.agendaActiva !== false).length}</strong><span className="delta">+2 pts vs anterior</span></article>
              <article className="kpi"><span className="kpi-label">Citas por Aprobar</span><strong>{stats.citasPendientes}</strong><span className="delta down">-1 pt vs anterior</span></article>
              <article className="kpi"><span className="kpi-label">Citas Canceladas</span><strong>{stats.citasCanceladas}</strong><span className="delta down">+5 vs anterior</span></article>
            </section>

            <div className="split">
              <section className="panel">
                <div className="panel-head"><div><h2>Citas por día</h2><p className="hint">Últimos 14 días</p></div><div className="legend"><span>Citas programadas</span></div></div>
                <svg className="chart" viewBox="0 0 640 240">
                  <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={{ stopColor: 'var(--accent)', stopOpacity: .28 }}/><stop offset="1" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }}/></linearGradient></defs>
                  {[0, 10, 20, 30].map(g => {
                    const y = pt + ph - (g / max) * ph;
                    return (<g key={g}><line x1={pl} x2={W - pr} y1={y} y2={y} style={{ stroke: 'var(--line)' }} strokeWidth="1" /><text x={pl - 8} y={y + 4} textAnchor="end" style={{ fill: 'var(--muted)' }} fontSize="11">{g}</text></g>);
                  })}
                  {pts.map(p => p.i % 2 === 0 && <text key={p.i} x={p.x} y={H - 8} textAnchor="middle" style={{ fill: 'var(--muted)' }} fontSize="11">{p.v}</text>)}
                  <path d={areaPath} fill="url(#fill)"/><path d={linePath} fill="none" style={{ stroke: 'var(--accent)' }} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
                  {pts.map(p => { const last = p.i === n - 1; return <circle key={p.i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={last ? 6 : 3.5} style={{ fill: last ? 'var(--accent)' : 'var(--surface)', stroke: 'var(--accent)' }} strokeWidth="2" />; })}
                </svg>
              </section>

              <section className="panel">
                <div className="panel-head"><h2>Incidencias</h2><span className="hint">{incidents.length} abiertas</span></div>
                <ul className="inc">
                  {incidents.map(i => (
                    <li key={i.id} data-sev={i.sev}>
                      <div><strong>{i.title}</strong><small>{i.sub}</small></div>
                      <button className="btn" onClick={() => handleResolve(i.id)}>Resolver</button>
                    </li>
                  ))}
                </ul>
                {incidents.length === 0 && <p className="empty">No hay incidencias abiertas.</p>}
              </section>
            </div>
          </>
        )}

        {/* --- VISTA: CITAS --- */}
        {activeView === 'citas' && (
          <div className="view-container">
            <header className="top" style={{borderBottom: 'none'}}>
              <div><p className="eyebrow">Gestión</p><h1>Todas las Citas</h1></div>
            </header>
            <section className="panel" style={{marginTop: '20px'}}>
              <div className="table-wrap">
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                  <thead>
                    <tr style={{borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase'}}>
                      <th style={{paddingBottom: '16px'}}>Fecha / Hora</th>
                      <th style={{paddingBottom: '16px'}}>Paciente</th>
                      <th style={{paddingBottom: '16px'}}>Médico Asignado</th>
                      <th style={{paddingBottom: '16px'}}>Motivo</th>
                      <th style={{paddingBottom: '16px'}}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citasLista.length > 0 ? (
                      citasLista.map(cita => (
                        <tr key={cita._id} style={{borderBottom: '1px solid var(--line)', verticalAlign: 'top'}}>
                          <td style={{padding: '16px 0'}}>
                            <strong>{cita.dia !== 'Por definir' && cita.dia ? cita.dia : '--/--/----'}</strong><br/>
                            <small style={{color: 'var(--muted)'}}>{cita.horario !== 'Por definir' && cita.horario ? cita.horario : 'Pendiente'}</small>
                          </td>
                          <td style={{padding: '16px 0'}}>{cita.pacienteId?.name || 'Usuario eliminado'}</td>
                          <td style={{padding: '16px 0'}}>{cita.medicoId?.name || 'Sin asignar'}</td>
                          <td style={{padding: '16px 0'}}>{cita.motivo}</td>
                          <td style={{padding: '16px 0', maxWidth: '250px'}}>
                            <span className="pill" style={{
                              backgroundColor: cita.estado === 'atendida' ? 'rgba(46, 204, 113, 0.1)' : cita.estado === 'cancelada' ? 'rgba(255, 91, 91, 0.1)' : 'rgba(142, 125, 255, 0.1)',
                              color: cita.estado === 'atendida' ? '#2ecc71' : cita.estado === 'cancelada' ? '#ff5b5b' : '#8e7dff'
                            }}>
                              {cita.estado.toUpperCase()}
                            </span>
                            
                            {/* NUEVO: Muestra la razón de cancelación o declinación si existe */}
                            {cita.estado === 'cancelada' && cita.razonCancelacion && (
                              <div style={{ marginTop: '8px', fontSize: '12px', color: '#ff5b5b', backgroundColor: 'rgba(255, 91, 91, 0.05)', padding: '6px', borderRadius: '4px', borderLeft: '2px solid #ff5b5b' }}>
                                <strong>Razón:</strong> {cita.razonCancelacion}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px', color: 'var(--muted)'}}>No hay citas registradas en el sistema.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* --- VISTA: MÉDICOS --- */}
        {activeView === 'medicos' && (
          <div className="view-container">
            <header className="top" style={{borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
              <div><p className="eyebrow">Personal</p><h1>Directorio Médico</h1></div>
              <button className="btn btn-primary" type="button" onClick={() => setIsModalOpen(true)}>+ Registrar Médico</button>
            </header>
            <section className="panel" style={{marginTop: '20px'}}>
              <div className="table-wrap">
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                  <thead>
                    <tr style={{borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase'}}>
                      <th style={{paddingBottom: '16px'}}>Médico y Especialidad</th>
                      <th style={{paddingBottom: '16px'}}>Correo</th>
                      <th style={{paddingBottom: '16px'}}>Estado de la Agenda</th>
                      <th style={{paddingBottom: '16px', textAlign: 'right'}}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicos.length > 0 ? (
                      medicos.map(medico => (
                        <tr key={medico._id} style={{borderBottom: '1px solid var(--line)'}}>
                          <td style={{padding: '16px 0'}}><strong style={{display: 'block', marginBottom: '4px'}}>{medico.name}</strong><small style={{color: 'var(--muted)'}}>{medico.especialidad || 'Medicina General'}</small></td>
                          <td style={{padding: '16px 0'}}>{medico.email}</td>
                          <td style={{padding: '16px 0'}}>
                            {medico.agendaActiva !== false ? (
                              <span style={{backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'}}>🟢 Recibiendo Citas</span>
                            ) : (
                              <span style={{backgroundColor: 'rgba(243, 156, 18, 0.1)', color: '#f39c12', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'}}>🟡 Agenda Pausada</span>
                            )}
                          </td>
                          <td style={{padding: '16px 0', textAlign: 'right'}}>
                            {medico.agendaActiva !== false ? (
                              <button style={{background: 'none', border: 'none', color: '#f39c12', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => handleToggleAgendaMedico(medico._id, medico.agendaActiva)}>Forzar Pausa</button>
                            ) : (
                              <button style={{background: 'none', border: 'none', color: '#2ecc71', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => handleToggleAgendaMedico(medico._id, medico.agendaActiva)}>Reactivar</button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px', color: 'var(--muted)'}}>No hay médicos registrados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* --- VISTA: PACIENTES --- */}
        {activeView === 'pacientes' && (
          <div className="view-container">
            <header className="top" style={{borderBottom: 'none'}}>
              <div><p className="eyebrow">Directorio</p><h1>Registro de Pacientes</h1></div>
            </header>
            <section className="panel" style={{marginTop: '20px'}}>
              <div className="table-wrap">
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                  <thead>
                    <tr style={{borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase'}}>
                      <th style={{paddingBottom: '16px'}}>Nombre del Paciente</th>
                      <th style={{paddingBottom: '16px'}}>Correo y Contacto</th>
                      <th style={{paddingBottom: '16px'}}>Sangre / Alergias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientes.length > 0 ? (
                      pacientes.map(paciente => (
                        <tr key={paciente._id} style={{borderBottom: '1px solid var(--line)'}}>
                          <td style={{padding: '16px 0'}}><strong>{paciente.name}</strong></td>
                          <td style={{padding: '16px 0'}}>{paciente.email}<br/><small style={{color: 'var(--muted)'}}>{paciente.phone || 'Sin número'}</small></td>
                          <td style={{padding: '16px 0'}}>
                            <span style={{color: 'var(--danger)'}}>{paciente.bloodType || '--'}</span>
                            <br/><small style={{color: 'var(--muted)'}}>{paciente.allergies || 'Sin alergias'}</small>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3" style={{textAlign: 'center', padding: '30px', color: 'var(--muted)'}}>No hay pacientes registrados en la base de datos.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* --- MODAL DE REGISTRO --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>✕</button>
            <div className="modal-header"><h2>Registro Interno de Personal</h2><p>Crea una cuenta para un doctor.</p></div>
            {error && <div className="modal-alert error">{error}</div>}
            {success && <div className="modal-alert success">{success}</div>}
            <form onSubmit={handleRegisterDoctor} className="modal-form">
              <div className="form-group-hz"><label>Nombre</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div className="form-row-hz">
                <div className="form-group-hz half"><label>Correo</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div className="form-group-hz half"><label>Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              </div>
              <div className="form-group-hz"><label>Especialidad</label><input type="text" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} required /></div>
              <div className="schedule-box-hz">
                <label className="schedule-title">Horarios</label>
                {horarios.map((horario, index) => (
                  <div key={index} className="schedule-row-hz">
                    <select className="input-hz" value={horario.dia} onChange={(e) => handleHorarioChange(index, 'dia', e.target.value)}>
                      <option value="Lunes">Lunes</option><option value="Martes">Martes</option><option value="Miércoles">Miércoles</option><option value="Jueves">Jueves</option><option value="Viernes">Viernes</option>
                    </select>
                    <input type="time" className="input-hz" value={horario.horaInicio} onChange={(e) => handleHorarioChange(index, 'horaInicio', e.target.value)} required />
                    <span className="separator-hz">a</span>
                    <input type="time" className="input-hz" value={horario.horaFin} onChange={(e) => handleHorarioChange(index, 'horaFin', e.target.value)} required />
                    {horarios.length > 1 && <button type="button" className="btn-remove-hz" onClick={() => handleRemoveHorario(index)}>✕</button>}
                  </div>
                ))}
                <button type="button" className="btn-add-hz" onClick={handleAddHorario}>+ Agregar horario</button>
              </div>
              <button type="submit" className="btn-submit-hz">Registrar Médico</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL ADMIN --- */}
      {isAdminSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsAdminSettingsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setIsAdminSettingsOpen(false)}>✕</button>
            <h2>Panel de Administrador</h2><p className="hint" style={{marginBottom: '24px'}}>Opciones de cuenta.</p>
            <div className="settings-section"><h3>Seguridad</h3><button className="btn btn-ghost" style={{width: '100%', justifyContent: 'flex-start', padding: '12px', marginTop: '8px', border: '1px solid var(--line)'}}>Cambiar mi contraseña</button></div>
            <div className="settings-section" style={{marginTop: '24px'}}><h3>Sesión</h3><button className="btn btn-ghost" style={{width: '100%', justifyContent: 'flex-start', padding: '12px', marginTop: '8px', border: '1px solid var(--line)', color: '#ff4d4d'}} onClick={handleLogout}>🚪 Cerrar Sesión</button></div>
            <button type="button" className="btn btn-primary" style={{width: '100%', marginTop: '32px'}} onClick={() => setIsAdminSettingsOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;