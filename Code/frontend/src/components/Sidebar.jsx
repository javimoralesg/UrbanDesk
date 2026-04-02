import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router";
import '../assets/css/Sidebar.css';
import { api } from '../services/api';

const opcionesGlobales = {
    SinRegistro: [
        { text: "Portada", link: "/incidencias-urbanas" },
        { text: "Registrarse", link: "/incidencias-urbanas/register" },
        { text: "Iniciar sesión", link: "/incidencias-urbanas/login" },
        { text: "Registrar incidencia", link: "/incidencias-urbanas/registrar-incidencia" },
    ],
    Usuario: [
        { text: "Portada", link: "/incidencias-urbanas" },
        { text: "Cerrar sesión", link: "/incidencias-urbanas/logout" },
        { text: "Editar perfil", link: "/incidencias-urbanas/editar-perfil " },
        { text: "Mis incidencias", link: "/incidencias-urbanas/mis-incidencias" },
        { text: "Registrar incidencia", link: "/incidencias-urbanas/registrar-incidencia" },
    ],
    Operador: [
        { text: "Portada", link: "/incidencias-urbanas" },
        { text: "Cerrar sesión", link: "/incidencias-urbanas/logout" },
        { text: "Editar perfil", link: "/incidencias-urbanas/editar-perfil " },
        { text: "Consultar incidencias", link: "/incidencias-urbanas/mis-incidencias" },
        { text: "Buscar incidencias cercanas", link: "/incidencias-urbanas/buscar-incidencias-cercanas" },
        { text: "Generar informe", link: "/incidencias-urbanas/generar-informe" },
    ],
    Tecnico: [
        { text: "Portada", link: "/incidencias-urbanas" },
        { text: "Cerrar sesión", link: "/incidencias-urbanas/logout" },
        { text: "Editar perfil", link: "/incidencias-urbanas/editar-perfil " },
        { text: "Consultar incidencias", link: "/incidencias-urbanas/mis-incidencias" },
    ]
  };

export default function Sidebar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userRole, setUserRole] = useState('SinRegistro');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.rol) {
      if (user.rol === 'CIUDADANO') setUserRole('Usuario');
      else if (user.rol === 'OPERADOR') setUserRole('Operador');
      else if (user.rol === 'TECNICO') setUserRole('Tecnico');
      else setUserRole('SinRegistro');
    } else {
      setUserRole('SinRegistro');
    }
  }, [location.pathname]);

  const opciones = opcionesGlobales[userRole] || opcionesGlobales.SinRegistro;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <aside className="urban-sidebar__sidebar">
      {isMobile ? (
        <>
          {!menuOpen && (
            <button
              className="urban-sidebar__toggle-btn"
              onClick={() => setMenuOpen(true)}
            >
              VER OPCIONES
              <img src='/desplegable.png' alt='Desplegable' className="urban-sidebar__toggle-icon" />
            </button>
          )}
          <nav className={`urban-sidebar__nav${menuOpen ? ' urban-sidebar__nav--open' : ''}`}>
             {opciones.map((opcion, index) => (
              opcion.link !== "/incidencias-urbanas/logout" ? (
              <Link
                key={index}
                to={opcion.link}
                className={`urban-sidebar__sidebar-title ${
                  location.pathname === opcion.link ? "urban-sidebar__sidebar-title--active" : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <span>{opcion.text}</span>
              </Link>
            )
            : (<Link
                key={index}
                onClick={() => api.logout()}
                className={`urban-sidebar__sidebar-title ${
                  location.pathname === opcion.link ? "urban-sidebar__sidebar-title--active" : ""
                }`}
              >
                <span>{opcion.text}</span>
              </Link>)
            ))}
            {menuOpen && (
              <button
                className="urban-sidebar__close-btn"
                onClick={() => setMenuOpen(false)}
              >
                OCULTAR OPCIONES
                <img src='/desplegable.png' alt='Desplegable' className="urban-sidebar__toggle-icon-inverted" />
              </button>
            )}
          </nav>
        </>
      ) : (
        <nav className="urban-sidebar__nav">
           {opciones.map((opcion, index) => (
              opcion.link !== "/incidencias-urbanas/logout" ? (
              <Link
              key={index}
              to={opcion.link}
              className={`urban-sidebar__sidebar-title ${
                location.pathname === opcion.link ? "urban-sidebar__sidebar-title--active" : ""
              }`}
            >
              <span>{opcion.text}</span>
            </Link>
          )
          : (<Link
              key={index}
              onClick={() => api.logout()}
              className={`urban-sidebar__sidebar-title ${
                location.pathname === opcion.link ? "urban-sidebar__sidebar-title--active" : ""
              }`}
            >
              <span>{opcion.text}</span>
            </Link>)
          ))}
        </nav>
      )}
    </aside>
  );
}