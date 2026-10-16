import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = ({ children, title, subtitle, userName, userInitials }) => {
  const navigate = useNavigate();
  // Estado para controlar si el menú del avatar está abierto
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Ref para detectar clics fuera del menú y cerrarlo
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Función temporal para simular el botón de modo claro (luego implementaremos la lógica real)
  const handleThemeToggle = () => {
    alert("Función de Modo Claro en desarrollo.");
  };

  // Efecto para cerrar el menú si el usuario hace clic en cualquier otro lugar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Obtenemos el correo del localStorage si existe
  const userEmail = localStorage.getItem('userEmail') || 'usuario@correo.com';

  return (
    <div className="layout-container">
      {/* BARRA SUPERIOR (Topbar) */}
      <header className="topbar">
        <div className="topbar-left">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--accent-primary)" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 10h-4V6c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v4H5c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h4v4c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-4h4c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2z"/>
          </svg>
          <div className="topbar-titles">
            <h1>Mi Salud</h1>
            <p>Plaza De La Salud</p>
          </div>
        </div>

        <div className="topbar-right">
          <button className="btn-theme-toggle" onClick={handleThemeToggle}>Modo claro</button>
          
          <div className="user-profile-section" ref={dropdownRef}>
            {/* Ocultamos el botón "Cerrar sesión" suelto, ahora vivirá en el menú */}
            <div className="user-avatar" onClick={toggleDropdown}>
              {userInitials || 'US'}
            </div>

            {/* MENÚ DESPLEGABLE (Estilo YouTube) */}
            {isDropdownOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">{userInitials || 'US'}</div>
                  <div className="dropdown-user-info">
                    <strong>{userName || 'Usuario'}</strong>
                    <span>{userEmail}</span>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <ul className="dropdown-menu-list">
                  <li>
                    <span className="menu-icon">👤</span> 
                    Mi perfil
                  </li>
                  <li>
                    <span className="menu-icon">⚙️</span> 
                    Configuración
                  </li>
                  <div className="dropdown-divider"></div>
                  <li onClick={handleLogout} className="logout-item">
                    <span className="menu-icon">🚪</span> 
                    Cerrar sesión
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ÁREA PRINCIPAL */}
      <main className="main-content">
        <div className="page-header">
          <p className="page-date">MARTES, 13 DE OCTUBRE</p> 
          <h2 className="page-title">{title}</h2>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>

        <div className="page-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;