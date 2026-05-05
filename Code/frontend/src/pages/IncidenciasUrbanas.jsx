import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import "../assets/css/IncidenciasUrbanas.css";
import { api } from '../services/api';

const opcionesGlobales = {
  SinRegistro: [
    { text: "Portada", link: "/incidencias-urbanas" },
    { text: "Registrarse", link: "/incidencias-urbanas/register" },
    { text: "Iniciar sesión", link: "/incidencias-urbanas/login" },
    { text: "Registrar incidencia", link: "/incidencias-urbanas/registrar-incidencia" },
    { text: "Incidencias públicas", link: "/incidencias-urbanas/incidencias-publicas" },

  ],
  Usuario: [
    { text: "Portada", link: "/incidencias-urbanas" },
    { text: "Cerrar sesión", link: "/incidencias-urbanas/logout" },
    { text: "Editar perfil", link: "/incidencias-urbanas/editar-perfil " },
    { text: "Mis incidencias", link: "/incidencias-urbanas/mis-incidencias" },
    { text: "Registrar incidencia", link: "/incidencias-urbanas/registrar-incidencia" },
    { text: "Incidencias públicas", link: "/incidencias-urbanas/incidencias-publicas" },
  ],
  Operador: [
    { text: "Portada", link: "/incidencias-urbanas" },
    { text: "Cerrar sesión", link: "/incidencias-urbanas/logout" },
    { text: "Editar perfil", link: "/incidencias-urbanas/editar-perfil " },
    { text: "Mis incidencias", link: "/incidencias-urbanas/mis-incidencias" },
    { text: "Buscar incidencias cercanas", link: "/incidencias-urbanas/buscar-incidencias-cercanas" },
    { text: "Generar informe", link: "/incidencias-urbanas/generar-informe" },
  ],
  Tecnico: [
    { text: "Portada", link: "/incidencias-urbanas" },
    { text: "Cerrar sesión", link: "/incidencias-urbanas/logout" },
    { text: "Editar perfil", link: "/incidencias-urbanas/editar-perfil " },
    { text: "Mis incidencias", link: "/incidencias-urbanas/mis-incidencias" },
  ]
};

export default function IncidenciasUrbanas() {
  const location = useLocation();
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

  const handleLinkClick = (event, link) => {
    if (link === '/incidencias-urbanas/logout') {
      event.preventDefault();
      api.logout();
    }
  };

  return (
    <>
      <Hero />

      <main className="urban-home__layout">
        <Sidebar />

        <section className="urban-home__content">
          <h2 className="urban-home__title">
            Portada
          </h2>

          <p className="urban-home__subtitle">
            Consulta toda la información relacionada con incidencias urbanas
          </p>

          <section className="urban-cards__cards">
            <div className="urban-cards__row urban-cards__row--intro">
              {opciones[0] && (
                <Link
                  key={0}
                  to={opciones[0].link}
                  className={`urban-cards__action-card ${location.pathname === opciones[0].link ? "urban-cards__action-card--active" : ""}`}
                  onClick={(event) => handleLinkClick(event, opciones[0].link)}
                >
                  <span>{opciones[0].text}</span>
                </Link>
              )}
            </div>

            <div className="urban-cards__row urban-cards__row--intro">
              {opciones[1] && (
                <Link
                  key={1}
                  to={opciones[1].link}
                  className={`urban-cards__action-card ${location.pathname === opciones[1].link ? "urban-cards__action-card--active" : ""}`}
                  onClick={(event) => handleLinkClick(event, opciones[1].link)}
                >
                  <span>{opciones[1].text}</span>
                </Link>
              )}

              {opciones[2] && (
                <Link
                  key={2}
                  to={opciones[2].link}
                  className={`urban-cards__action-card ${location.pathname === opciones[2].link ? "urban-cards__action-card--active" : ""}`}
                  onClick={(event) => handleLinkClick(event, opciones[2].link)}
                >
                  <span>{opciones[2].text}</span>
                </Link>
              )}
            </div>

            <div className="urban-cards__row">
              {opciones.slice(3).map((opcion, index) => (
                <Link
                  key={index + 3}
                  to={opcion.link}
                  className={`urban-cards__action-card ${location.pathname === opcion.link ? "urban-cards__action-card--active" : ""}`}
                  onClick={(event) => handleLinkClick(event, opcion.link)}
                >
                  <span>{opcion.text}</span>
                </Link>
              ))}
            </div>
          </section>

        </section>
      </main>
    </>
  );
}