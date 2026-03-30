import { Link, useLocation } from "react-router";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import "../assets/css/IncidenciasUrbanas.css";

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
        { text: "Consultar incidencias", link: "/incidencias-urbanas/consultar-incidencias" },
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

export default function IncidenciasUrbanas() {
  const location = useLocation();

  const opciones = opcionesGlobales.SinRegistro  // Se consulta en la bbdd que usuario esta autenticado

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
              <Link
                key={index}
                to={opcion.link}
                className={`urban-cards__action-card ${
                  location.pathname === opcion.link ? "urban-cards__action-card--active" : ""
                }`}
              >
                <span>{opcion.text}</span>
              </Link>
            ))}
          </section>

        </section>
      </main>
    </>
  );
}