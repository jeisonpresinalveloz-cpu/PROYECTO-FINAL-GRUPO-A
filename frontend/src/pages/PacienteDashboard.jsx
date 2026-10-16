import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './PacienteDashboard.css';

const PacienteDashboard = () => {
  const [tab, setTab] = useState('up');
  const [citas, setCitas] = useState([]);
  const [confirmId, setConfirmId] = useState(null); // Para el sub-menú de cancelar
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
  
  // --- Estados del Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicoId, setMedicoId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // --- Estados para Nuevos Modales ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
// Datos temporales para el formulario del perfil
  const [profileData, setProfileData] = useState({
    name: localStorage.getItem('userName') || '', // <-- Leemos directamente de la memoria aquí
    email: localStorage.getItem('userEmail') || '',
    phone: '',
    bloodType: '',
    allergies: ''
  });

  // Datos temporales para la configuración
  const [settingsData, setSettingsData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: true
  });

  const handleRequestPasswordChange = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    try {
      await axios.post('http://localhost:5000/api/auth/olvide-password', { email });
      alert('Se ha enviado un enlace seguro a tu correo para cambiar la contraseña.');
      setIsSettingsModalOpen(false);
    } catch (error) {
      alert('Hubo un error al solicitar el cambio de contraseña. Intenta de nuevo.');
      console.error(error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Obtenemos el ID del paciente que guardaste al iniciar sesión
      // (Si en tu Login guardaste el id con otro nombre como '_id', asegúrate de cambiarlo aquí)
      const userId = localStorage.getItem('userId'); 

      if (!userId) {
        alert('Error: No se encontró la sesión del usuario.');
        return;
      }

      // Enviamos la información al backend
      const res = await axios.put('http://localhost:5000/api/users/profile', {
        userId,
        name: profileData.name,
        phone: profileData.phone,
        bloodType: profileData.bloodType,
        allergies: profileData.allergies
      });

      // Si el paciente cambió su nombre, actualizamos la memoria para que 
      // la interfaz (como el Hola, María) se actualice sin tener que recargar.
      localStorage.setItem('userName', profileData.name);
      
      alert('Perfil actualizado exitosamente.');
      setIsProfileModalOpen(false); // Cerramos el modal de forma elegante

    } catch (error) {
      alert(error.response?.data?.mensaje || 'Error al guardar los cambios del perfil');
      console.error(error);
    }
  };
  
  // Lista temporal de médicos (Idealmente cargar del backend)
  const [medicosDisponibles, setMedicosDisponibles] = useState([
    { _id: '1', name: 'Dra. Lucía Herrera', especialidad: 'Medicina general' },
    { _id: '2', name: 'Dr. Mateo Ortiz', especialidad: 'Cardiología' }
  ]);

  const userName = localStorage.getItem('userName') || 'Paciente';
  const userId = localStorage.getItem('userId');
  const getInitials = (name) => name.slice(0, 2).toUpperCase();
  const primerNombre = userName.split(' ')[0];

  // 1. Cargar citas desde el Backend
  const fetchCitas = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/citas/paciente/${userId}`);
      setCitas(res.data);
    } catch (error) {
      console.log("Aún no hay ruta de citas o no hay citas creadas.", error);
    }
  };

  useEffect(() => {
    if (userId) fetchCitas();
  }, [userId]);

  // 2. Agendar Cita (Se crea como PENDIENTE)
  const handleAgendarCita = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });
    
    try {
      await axios.post('http://localhost:5000/api/citas/crear', {
        pacienteId: userId,
        medicoId,
        fecha,
        hora,
        motivo,
        estado: 'pendiente' // El paciente solo solicita, queda pendiente
      });

      setMensaje({ texto: 'Cita solicitada. Esperando confirmación médica.', tipo: 'success' });
      fetchCitas(); 
      
      setTimeout(() => {
        setIsModalOpen(false);
        setMedicoId(''); setFecha(''); setHora(''); setMotivo(''); setMensaje({ texto: '', tipo: ''});
      }, 2000);
    } catch (error) {
      setMensaje({ texto: 'Error al solicitar la cita.', tipo: 'error' });
    }
  };

  // 3. Cancelar Cita (Solo si está pendiente o confirmada)
  const handleCancelarCita = async (id) => {
    try {
      // Idealmente harías un PUT a tu backend: axios.put(`/api/citas/${id}`, { estado: 'cancelada' })
      // Por ahora actualizamos el estado local:
      setCitas(citas.map(c => c._id === id ? { ...c, estado: 'cancelada' } : c));
      setConfirmId(null);
    } catch (error) {
      console.error("Error al cancelar la cita");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const citasFiltradas = citas.filter(c => {
    if (tab === 'up') return c.estado === 'pendiente' || c.estado === 'confirmada';
    return c.estado === 'atendida' || c.estado === 'cancelada';
  });

  const proximaCita = citas.find(c => c.estado === 'confirmada') || citas.find(c => c.estado === 'pendiente');

  return (
    <div className="mi-salud-app">
      <div className="wrap">
        
        {/* Cabecera (Idéntica al HTML original) */}
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

        <section className="greet">+
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
                  <div className="cal"><span>{proximaCita.fecha ? proximaCita.fecha.split('-')[2] : '00'}</span><small>DÍA</small></div>
                  <div>
                    <h2 className="next-doc">{proximaCita.medicoId?.name || 'Médico'}</h2>
                    <p className="next-meta">{proximaCita.fecha} · {proximaCita.hora} · {proximaCita.motivo}</p>
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
                <strong>Agendar cita</strong><small>Médico y horario</small>
              </button>
              <button className="tile">
                <span className="tile-ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M7 3h7l5 5v13H7z M14 3v5h5"/></svg></span>
                <strong>Resultados</strong><small>Revisa tus análisis</small>
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
              {citasFiltradas.map(cita => (
                <li key={cita._id} className="row" data-status={cita.estado}>
                  <div className="cal"><span>{cita.fecha ? cita.fecha.split('-')[2] : '00'}</span><small>DÍA</small></div>
                  <div>
                    <div className="row-top">
                      <strong>{cita.motivo}</strong>
                      <span className="pill">{cita.estado.toUpperCase()}</span>
                    </div>
                    <p className="meta">{cita.medicoId?.name || 'Médico'} · {cita.hora}</p>
                    <div className="row-foot">
                      <span className="hint">{cita.fecha}</span>
                      <div className="row-actions">
                        {confirmId === cita._id ? (
                          <div className="confirm-row">
                            <span>¿Cancelar cita?</span>
                            <button className="btn btn-danger" onClick={() => handleCancelarCita(cita._id)}>Sí, cancelar</button>
                            <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Volver</button>
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
              ))}
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
            <p className="hint" style={{marginBottom: '20px'}}>Selecciona el médico y el horario.</p>

            {mensaje.texto && <div className={`modal-alert ${mensaje.tipo}`}>{mensaje.texto}</div>}

            <form onSubmit={handleAgendarCita} className="agendar-form">
              <div className="form-group">
                <label>Especialista</label>
                <select value={medicoId} onChange={(e) => setMedicoId(e.target.value)} required>
                  <option value="">Selecciona un médico...</option>
                  {medicosDisponibles.map(med => (
                    <option key={med._id} value={med._id}>{med.name} - {med.especialidad}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha sugerida</label>
                  <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Hora deseada</label>
                  <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Motivo de la consulta</label>
                <input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. Dolor de cabeza frecuente..." required />
              </div>
              <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '10px'}}>Solicitar Cita</button>
            </form>
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
              <button 
              className="btn btn-ghost" 
              style={{width: '100%', justifyContent: 'flex-start', padding: '12px', marginTop: '8px', border: '1px solid var(--line)'}}
              onClick={handleRequestPasswordChange}
              >
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