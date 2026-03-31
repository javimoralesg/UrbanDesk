import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router";
import '../assets/css/Sidebar.css';

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
        { text: "Consultar incidencias", link: "/incidencias-urbanas/consultar-incidencias" },
        { text: "Buscar incidencias cercanas", link: "/incidencias-urbanas/buscar-incidencias-cercanas" },
        { text: "Generar informe", link: "/incidencias-urbanas/generar-informe" },
    ],
    Tecnico: [
        { text: "Portada", link: "/incidencias-urbanas" },
        { text: "Cerrar sesión", link: "/incidencias-urbanas/logout" },
        { text: "Editar perfil", link: "/incidencias-urbanas/editar-perfil " },
        { text: "Consultar incidencias", link: "/incidencias-urbanas/consultar-incidencias" },
    ]
  };

export default function Sidebar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const opciones = opcionesGlobales.Operador  // Se consulta en la bbdd que usuario esta autenticado

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
            {menuOpen && opciones.map((option, index) => (
              <Link
                key={index}
                to={option.link}
                className={`urban-sidebar__sidebar-title ${
                  location.pathname === option.link ? "urban-sidebar__sidebar-title--active" : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <span>{option.text}</span>
              </Link>
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
          {opciones.map((option, index) => (
            <Link
              key={index}
              to={option.link}
              className={`urban-sidebar__sidebar-title ${
                location.pathname === option.link ? "urban-sidebar__sidebar-title--active" : ""
              }`}
            >
              <span>{option.text}</span>
            </Link>
          ))}
        </nav>
      )}
    </aside>
  );
}