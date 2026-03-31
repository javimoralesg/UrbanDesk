import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from '../components/MapLocate';
import { Link } from "react-router";
import "../assets/css/ConsultarIncidencias.css"; 

export default function ConsultarIncidencias() {
  return (
    <>
      <Hero />
      <main className="consultar-incidencias__layout">
        <Sidebar />
        <div className="consultar-incidencias__content">
          <h2 className="consultar-incidencias__title">
            Consultar Incidencias
          </h2>

          <p className="consultar-incidencias__subtitle">
            Consulta toda la información relacionada con incidencias urbanas
          </p>

          <div className="consultar-incidencias__topbar">
            <div className="consultar-incidencias__view-buttons">
              <button className="consultar-incidencias__view-btn consultar-incidencias__view-btn--active">
              </button>
              <button className="consultar-incidencias__view-btn">
              </button>
            </div>

            <div className="consultar-incidencias__filters">
              <button className="consultar-incidencias__filter-btn consultar-incidencias__filter-btn--active">
                Creada
              </button>
              <button className="consultar-incidencias__filter-btn">
                Validada
              </button>
              <button className="consultar-incidencias__filter-btn">
                Asignada
              </button>
              <button className="consultar-incidencias__filter-btn">
                En curso
              </button>
              <button className="consultar-incidencias__filter-btn">
                Resuelta
              </button>
            </div>
          </div>

          <div className="consultar-incidencias__table">
            <div className="consultar-incidencias__header">
              <span>id</span>
              <span>descripción</span>
              <span>prioridad</span>
              <span>estado</span>
              <span></span>
            </div>

            <div className="consultar-incidencias__rows">
              <div className="consultar-incidencias__row">
                <span></span>
                <span></span>
                <span></span>
                <span>Creada</span>
                <Link
                  to="/incidencias-urbanas/detalle-incidencia"
                  className="consultar-incidencias__more-btn"
                >
                  Ver más
                </Link>
              </div>

              <div className="consultar-incidencias__row">
                <span></span>
                <span></span>
                <span></span>
                <span>Creada</span>
                <Link
                  to="/incidencias-urbanas/detalle-incidencia"
                  className="consultar-incidencias__more-btn"
                >
                  Ver más
                </Link>
              </div>
            </div>
          </div>

          <div className="consultar-incidencias__map-container">
            <MapLocate width="100%" />
          </div>
        </div>
      </main>
    </>
  );
}