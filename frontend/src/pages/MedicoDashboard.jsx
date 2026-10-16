import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './MedicoDashboard.css';

const MedicoDashboard = () => {
  // Lógica del menú desplegable
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

  // ESTADO DE LA AGENDA
  const [agendaActiva, setAgendaActiva] = useState(true);

  // CITAS DEL MÉDICO (Simulando la BD)
  const [citas, setCitas] = useState([
    { id: '1', time: '08:00', name: 'Carlos Mendoza', age: 58, reason: 'Control de presión arterial', status: 'done' },
    { id: '2', time: '09:30', name: 'Ana Gómez', age: 42, reason: 'Chequeo anual', status: 'wait' },
    { id: '3', time: '11:30', name: 'Jorge Almonte', age: 63, reason: 'Consulta de seguimiento', status: 'cancelled' },
    { id: '4', time: '14:00', name: 'Daniela Féliz', age: 35, reason: 'Entrega de resultados', status: 'pending' }
  ]);

  const [resultados, setResultados] = useState([
    { id: 'r1', name: 'Perfil lipídico', who: 'Ana Gómez' },
    { id: 'r2', name: 'Glucosa en ayunas', who: 'Daniela Féliz' }
  ]);

  // FUNCIONES LÓGICAS
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const cambiarEstadoCita = (id, nuevoEstado) => {
    setCitas(citas.map(c => c.id === id ? { ...c, status: nuevoEstado } : c));
  };

  const marcarResultadoRevisado = (id) => {
    setResultados(resultados.filter(r => r.id !== id));
  };

  // CÁLCULOS PARA LA INTERFAZ
  const pacientesHoy = citas.filter(c => c.status !== 'cancelled').length;
  const atendidos = citas.filter(c => c.status === 'done').length;
  const enSalaOconsulta = citas.filter(c => c.status === 'wait' || c.status === 'live').length;
  const finalizados = citas.filter(c => c.status === 'done' || c.status === 'cancelled').length;

  // Buscar quién es el paciente actual (El que está 'live', si no 'wait', si no 'pending')
  const pacienteActual = citas.find(c => c.status === 'live') 
    || citas.find(c => c.status === 'wait') 
    || citas.find(c => c.status === 'pending');

  return (
    <div className="medico-plaza-app">
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
                    <li onClick={() => setAgendaActiva(!agendaActiva)}>
                      <span className="menu-icon">📅</span> {agendaActiva ? 'Pausar mi agenda' : 'Reactivar agenda'}
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
                  <p className="eyebrow">{pacienteActual.status === 'live' ? 'En consulta ahora' : 'Próximo paciente'}</p>
                  <h2>{pacienteActual.name}</h2>
                  <div className="hero-meta">
                    <span className="chip">{pacienteActual.time}</span>
                    <span className="chip">{pacienteActual.age} años</span>
                    <span className="chip">{pacienteActual.reason}</span>
                  </div>
                  <div className="actions">
                    {pacienteActual.status === 'live' ? (
                      <button className="btn btn-primary" onClick={() => cambiarEstadoCita(pacienteActual.id, 'done')}>Finalizar consulta</button>
                    ) : (
                      <button className="btn btn-primary" onClick={() => cambiarEstadoCita(pacienteActual.id, 'live')}>Iniciar consulta</button>
                    )}
                    <button className="btn">Ver expediente</button>
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
                  <li key={cita.id} className="row" data-status={cita.status}>
                    <span className="time">{cita.time}</span>
                    <div>
                      <div className="row-top">
                        <strong>{cita.name}</strong>
                        <span className="pill">
                          {cita.status === 'pending' && 'Por llegar'}
                          {cita.status === 'wait' && 'En sala'}
                          {cita.status === 'live' && 'En consulta'}
                          {cita.status === 'done' && 'Atendido'}
                          {cita.status === 'cancelled' && 'No asistió'}
                        </span>
                      </div>
                      <p className="meta">{cita.reason} · {cita.age} años</p>
                      <div className="row-foot">
                        <span className="hint"></span>
                        <div className="row-actions">
                          {cita.status === 'pending' && <button className="btn" onClick={() => cambiarEstadoCita(cita.id, 'wait')}>Llamar a sala</button>}
                          {cita.status === 'wait' && <button className="btn btn-primary" onClick={() => cambiarEstadoCita(cita.id, 'live')}>Iniciar consulta</button>}
                          {cita.status === 'live' && <button className="btn btn-primary" onClick={() => cambiarEstadoCita(cita.id, 'done')}>Finalizar</button>}
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
                  <li key={res.id}>
                    <div><strong>{res.name}</strong><small>{res.who}</small></div>
                    <button className="btn" onClick={() => marcarResultadoRevisado(res.id)}>Marcar revisado</button>
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
    </div>
  );
};

export default MedicoDashboard;