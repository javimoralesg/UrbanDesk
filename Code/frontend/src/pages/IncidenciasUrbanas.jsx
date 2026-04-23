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
    //{ text: "Buscar incidencias cercanas", link: "/incidencias-urbanas/buscar-incidencias-cercanas" },
    //{ text: "Generar informe", link: "/incidencias-urbanas/generar-informe" },
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
            {opciones.map((opcion, index) => (
              opcion.link !== "/incidencias-urbanas/logout" ? (
                <Link
                  key={index}
                  to={opcion.link}
                  className={`urban-cards__action-card ${location.pathname === opcion.link ? "urban-cards__action-card--active" : ""
                    }`}
                >
                  <span>{opcion.text}</span>
                </Link>
              )
                : (<Link
                  key={index}
                  onClick={() => api.logout()}
                  className={`urban-cards__action-card ${location.pathname === opcion.link ? "urban-cards__action-card--active" : ""
                    }`}
                >
                  <span>{opcion.text}</span>
                </Link>)
            ))}

          </section>

        </section>
      </main>
    </>
  );
}