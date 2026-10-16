import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const SERIES = [14, 18, 16, 21, 19, 12, 9, 17, 22, 20, 18, 24, 21, 15];

const AdminDashboard = () => {
  // Estados para las estadísticas y tablas
  const [stats, setStats] = useState({ doctoresRegistrados: 0, citasTotales: 0, citasPendientes: 0, citasCanceladas: 0 });
  const [range, setRange] = useState(7);
  const [docs, setDocs] = useState([
    { id: 'lh', name: 'Dra. Lucía Herrera', spec: 'Medicina general', today: 7, max: 9, status: 'busy', active: true },
    { id: 'mo', name: 'Dr. Mateo Ortiz', spec: 'Cardiología', today: 5, max: 9, status: 'free', active: true },
    { id: 'vp', name: 'Dra. Valentina Peña', spec: 'Pediatría', today: 8, max: 9, status: 'busy', active: true },
    { id: 'er', name: 'Dr. Esteban Ruiz', spec: 'Dermatología', today: 0, max: 9, status: 'leave', active: false }
  ]);
  const [incidents, setIncidents] = useState([
    { id: 'i1', sev: 'high', title: 'Sala 2 sin esfigmomanómetro', sub: 'Reportado por enfermería hace 40 min' },
    { id: 'i2', sev: 'mid', title: '3 pacientes sin confirmar para mañana', sub: 'Enviar recordatorio antes de las 18:00' },
    { id: 'i3', sev: 'low', title: 'Factura del seguro en revisión', sub: 'Lote de 12 consultas de la semana pasada' }
  ]);

  // --- ESTADOS PARA EL MODAL Y EL FORMULARIO ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [horarios, setHorarios] = useState([{ dia: 'Lunes', horaInicio: '08:00', horaFin: '12:00' }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado para controlar la vista actual del administrador (por defecto 'resumen')
  const [activeView, setActiveView] = useState('resumen');
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);

  const userName = localStorage.getItem('userName') || 'Ricardo Peña';
  const getInitials = (name) => name.slice(0, 2).toUpperCase();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/stats');
        setStats(res.data);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      }
    };
    fetchStats();
  }, []);

  // --- LÓGICA DEL FORMULARIO DE MÉDICOS ---
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
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role: 'medico', especialidad, horarios });
      setSuccess('Médico registrado exitosamente en la base de datos.');
      setName(''); setEmail(''); setPassword(''); setEspecialidad('');
      setHorarios([{ dia: 'Lunes', horaInicio: '08:00', horaFin: '12:00' }]);
      
      // Actualizar estadísticas y cerrar modal después de 1.5 segundos
      const resStats = await axios.get('http://localhost:5000/api/admin/stats');
      setStats(resStats.data);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess('');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.mensaje || 'Error al registrar al personal médico.');
    }
  };

  const handleResolve = (id) => setIncidents(incidents.filter(i => i.id !== id));
  
  const toggleDocState = (id) => {
    setDocs(docs.map(d => {
      if (d.id === id) {
        const isActive = !d.active;
        return { ...d, active: isActive, status: isActive ? 'free' : 'leave' };
      }
      return d;
    }));
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
            <li>
              <button 
                aria-current={activeView === 'resumen' ? 'page' : undefined} 
                onClick={() => setActiveView('resumen')}
              >
                <span className="icon">📊</span> Resumen
              </button>
            </li>
            <li>
              <button 
                aria-current={activeView === 'citas' ? 'page' : undefined} 
                onClick={() => setActiveView('citas')}
              >
                <span className="icon">🗓️</span> Citas
              </button>
            </li>
            <li>
              <button 
                aria-current={activeView === 'medicos' ? 'page' : undefined} 
                onClick={() => setActiveView('medicos')}
              >
                <span className="icon">👨‍⚕️</span> Médicos
              </button>
            </li>
            <li>
              <button 
                aria-current={activeView === 'pacientes' ? 'page' : undefined} 
                onClick={() => setActiveView('pacientes')}
              >
                <span className="icon">🏥</span> Pacientes
              </button>
            </li>
          </ul>
        </nav>
        
        <div 
          className="rail-foot" 
          onClick={() => setIsAdminSettingsOpen(true)}
          style={{ cursor: 'pointer', transition: 'background 0.2s' }}
          title="Configuración de Administrador"
        >
          <span className="avatar" aria-hidden="true">{getInitials(userName)}</span>
          <div><strong>{userName}</strong><small>Administrador</small></div>
        </div>
      </aside>

      <main className="main">
        {/* --- CONTENIDO DINÁMICO SEGÚN LA VISTA ACTIVA --- */}
        
        {/* VISTA: RESUMEN */}
        {activeView === 'resumen' && (
          <>
            <header className="top">
              <div>
                <p className="eyebrow">Hoy</p>
                <h1>Resumen general</h1>
              </div>
              <div className="top-actions">
                <div className="seg" role="group">
                  <button type="button" onClick={() => setRange(7)} aria-pressed={range === 7}>7 días</button>
                  <button type="button" onClick={() => setRange(30)} aria-pressed={range === 30}>30 días</button>
                </div>
                {/* BOTÓN PARA ABRIR MODAL */}
                <button className="btn btn-primary" type="button" onClick={() => setIsModalOpen(true)}>
                  + Registrar Médico
                </button>
              </div>
            </header>

            <section className="kpis">
              <article className="kpi"><span className="kpi-label">Citas Globales</span><strong>{stats.citasTotales}</strong><span className="delta">+8% vs anterior</span></article>
              <article className="kpi"><span className="kpi-label">Doctores Activos</span><strong>{stats.doctoresRegistrados}</strong><span className="delta">+2 pts vs anterior</span></article>
              <article className="kpi"><span className="kpi-label">Citas por Aprobar</span><strong>{stats.citasPendientes}</strong><span className="delta down">-1 pt vs anterior</span></article>
              <article className="kpi"><span className="kpi-label">Citas Canceladas</span><strong>{stats.citasCanceladas}</strong><span className="delta down">+5 vs anterior</span></article>
            </section>

            <div className="split">
              <section className="panel">
                <div className="panel-head">
                  <div><h2>Citas por día</h2><p className="hint">Últimos 14 días</p></div>
                  <div className="legend"><span>Citas programadas</span></div>
                </div>
                <svg className="chart" viewBox="0 0 640 240">
                  <defs>
                    <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" style={{ stopColor: 'var(--accent)', stopOpacity: .28 }}/>
                      <stop offset="1" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }}/>
                    </linearGradient>
                  </defs>
                  {[0, 10, 20, 30].map(g => {
                    const y = pt + ph - (g / max) * ph;
                    return (
                      <g key={g}>
                        <line x1={pl} x2={W - pr} y1={y} y2={y} style={{ stroke: 'var(--line)' }} strokeWidth="1" />
                        <text x={pl - 8} y={y + 4} textAnchor="end" style={{ fill: 'var(--muted)' }} fontSize="11">{g}</text>
                      </g>
                    );
                  })}
                  {pts.map(p => p.i % 2 === 0 && <text key={p.i} x={p.x} y={H - 8} textAnchor="middle" style={{ fill: 'var(--muted)' }} fontSize="11">{p.v}</text>)}
                  <path d={areaPath} fill="url(#fill)"/>
                  <path d={linePath} fill="none" style={{ stroke: 'var(--accent)' }} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
                  {pts.map(p => {
                    const last = p.i === n - 1;
                    return <circle key={p.i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={last ? 6 : 3.5} style={{ fill: last ? 'var(--accent)' : 'var(--surface)', stroke: 'var(--accent)' }} strokeWidth="2" />;
                  })}
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

            <section className="panel">
              <div className="panel-head"><div><h2>Médicos y disponibilidad</h2><p className="hint">Ocupación de hoy por médico</p></div></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Médico</th><th>Citas hoy</th><th>Ocupación</th><th>Estado</th><th></th></tr></thead>
                  <tbody>
                    {docs.map(d => (
                      <tr key={d.id}>
                        <td><strong>{d.name}</strong><small>{d.spec}</small></td>
                        <td className="num">{d.today}</td>
                        <td><span className="bar"><i style={{ width: `${Math.round((d.today / d.max) * 100)}%` }}></i></span></td>
                        <td><span className="pill" data-s={d.status}>{{ free: 'Disponible', busy: 'Ocupado', leave: 'De licencia' }[d.status]}</span></td>
                        <td style={{ textAlign: 'right' }}><button className="btn btn-ghost" onClick={() => toggleDocState(d.id)}>{d.active ? 'Pausar agenda' : 'Reactivar'}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* VISTA: CITAS */}
        {activeView === 'citas' && (
          <div className="view-container">
            <header className="top" style={{borderBottom: 'none'}}>
              <div>
                <p className="eyebrow">Gestión</p>
                <h1>Todas las Citas</h1>
              </div>
            </header>
            <section className="panel" style={{marginTop: '20px', padding: '40px', textAlign: 'center'}}>
              <h2 style={{color: 'var(--text-secondary)'}}>Módulo en construcción</h2>
              <p style={{color: 'var(--muted)'}}>Aquí se mostrará el historial completo de citas de la clínica.</p>
            </section>
          </div>
        )}

        {/* VISTA: MÉDICOS */}
        {activeView === 'medicos' && (
          <div className="view-container">
            <header className="top" style={{borderBottom: 'none'}}>
              <div>
                <p className="eyebrow">Personal</p>
                <h1>Directorio Médico</h1>
              </div>
            </header>
            <section className="panel" style={{marginTop: '20px', padding: '40px', textAlign: 'center'}}>
              <h2 style={{color: 'var(--text-secondary)'}}>Módulo en construcción</h2>
              <p style={{color: 'var(--muted)'}}>Aquí se listarán todos los médicos registrados y sus horarios.</p>
            </section>
          </div>
        )}

        {/* VISTA: PACIENTES */}
        {activeView === 'pacientes' && (
          <div className="view-container">
            <header className="top" style={{borderBottom: 'none'}}>
              <div>
                <p className="eyebrow">Directorio</p>
                <h1>Registro de Pacientes</h1>
              </div>
            </header>
            <section className="panel" style={{marginTop: '20px', padding: '40px', textAlign: 'center'}}>
              <h2 style={{color: 'var(--text-secondary)'}}>Módulo en construcción</h2>
              <p style={{color: 'var(--muted)'}}>Aquí se mostrará la base de datos de pacientes y sus historiales.</p>
            </section>
          </div>
        )}

      </main>

      {/* --- MODAL FLOTANTE: REGISTRO DE MÉDICO --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>✕</button>
            
            <div className="modal-header">
              <h2>Registro Interno de Personal</h2>
              <p>Crea una nueva cuenta de acceso para un doctor de la clínica.</p>
            </div>

            {error && <div className="modal-alert error">{error}</div>}
            {success && <div className="modal-alert success">{success}</div>}

            <form onSubmit={handleRegisterDoctor} className="modal-form">
              <div className="form-group-hz">
                <label>Nombre del Médico</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Dra. Pérez" required />
              </div>
              
              <div className="form-row-hz">
                <div className="form-group-hz half">
                  <label>Correo Institucional</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="medico@horizonte.com" required />
                </div>
                <div className="form-group-hz half">
                  <label>Contraseña Temporal</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>
              </div>

              <div className="form-group-hz">
                <label>Especialidad</label>
                <input type="text" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} placeholder="Ej. Pediatría, Cardiología..." required />
              </div>
              
              <div className="schedule-box-hz">
                <label className="schedule-title">Configuración de Horarios</label>
                {horarios.map((horario, index) => (
                  <div key={index} className="schedule-row-hz">
                    <select className="input-hz" value={horario.dia} onChange={(e) => handleHorarioChange(index, 'dia', e.target.value)}>
                      <option value="Lunes">Lunes</option>
                      <option value="Martes">Martes</option>
                      <option value="Miércoles">Miércoles</option>
                      <option value="Jueves">Jueves</option>
                      <option value="Viernes">Viernes</option>
                      <option value="Sábado">Sábado</option>
                    </select>
                    
                    <input type="time" className="input-hz" value={horario.horaInicio} onChange={(e) => handleHorarioChange(index, 'horaInicio', e.target.value)} required />
                    <span className="separator-hz">a</span>
                    <input type="time" className="input-hz" value={horario.horaFin} onChange={(e) => handleHorarioChange(index, 'horaFin', e.target.value)} required />
                    
                    {horarios.length > 1 && (
                      <button type="button" className="btn-remove-hz" onClick={() => handleRemoveHorario(index)}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-add-hz" onClick={handleAddHorario}>+ Agregar horario</button>
              </div>
              
              <button type="submit" className="btn-submit-hz">Registrar Médico en el Sistema</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIGURACIÓN DEL ADMIN --- */}
      {isAdminSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsAdminSettingsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setIsAdminSettingsOpen(false)}>✕</button>
            <h2>Panel de Administrador</h2>
            <p className="hint" style={{marginBottom: '24px'}}>Opciones de cuenta y seguridad.</p>
            
            <div className="settings-section">
              <h3>Seguridad</h3>
              <button 
                className="btn btn-ghost" 
                style={{width: '100%', justifyContent: 'flex-start', padding: '12px', marginTop: '8px', border: '1px solid var(--line)'}}
                onClick={() => alert("Función de cambiar contraseña en desarrollo")}
              >
                Cambiar mi contraseña
              </button>
            </div>

            <div className="settings-section" style={{marginTop: '24px'}}>
              <h3>Sesión</h3>
              <button 
                className="btn btn-ghost" 
                style={{width: '100%', justifyContent: 'flex-start', padding: '12px', marginTop: '8px', border: '1px solid var(--line)', color: '#ff4d4d'}}
                onClick={handleLogout}
              >
                <span style={{marginRight: '8px'}}>🚪</span> Cerrar Sesión
              </button>
            </div>
            
            <button type="button" className="btn btn-primary" style={{width: '100%', marginTop: '32px'}} onClick={() => setIsAdminSettingsOpen(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;