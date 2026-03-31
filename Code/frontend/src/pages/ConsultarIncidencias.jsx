import { useState } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
import { Link } from "react-router";
import "../assets/css/ConsultarIncidencias.css";

export default function ConsultarIncidencias() {
  const [vista, setVista] = useState("lista");

  const incidencias = [
    {
      id: 1,
      descripcion: "Farola rota en la calle principal",
      prioridad: "Alta",
      estado: "Creada",
    },
    {
      id: 2,
      descripcion: "Bache en la calzada",
      prioridad: "Media",
      estado: "Validada",
    },
    {
      id: 3,
      descripcion: "Contenedor desbordado",
      prioridad: "Baja",
      estado: "Asignada",
    },
    {
      id: 4,
      descripcion: "Señal de tráfico dañada",
      prioridad: "Alta",
      estado: "En curso",
    },
    {
      id: 5,
      descripcion: "Fuga de agua en acera",
      prioridad: "Alta",
      estado: "Resuelta",
    },
  ];

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
              <button
                type="button"
                className={`consultar-incidencias__view-btn ${
                  vista === "lista"
                    ? "consultar-incidencias__view-btn--active"
                    : ""
                }`}
                onClick={() => setVista("lista")}
              >
                Lista
              </button>

              <button
                type="button"
                className={`consultar-incidencias__view-btn ${
                  vista === "mapa"
                    ? "consultar-incidencias__view-btn--active"
                    : ""
                }`}
                onClick={() => setVista("mapa")}
              >
                Mapa
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

          {vista === "lista" ? (
            <div className="consultar-incidencias__table">
              <div className="consultar-incidencias__header">
                <span>id</span>
                <span>descripción</span>
                <span>prioridad</span>
                <span>estado</span>
                <span></span>
              </div>

              <div className="consultar-incidencias__rows">
                {incidencias.map((incidencia) => (
                  <div
                    key={incidencia.id}
                    className="consultar-incidencias__row"
                  >
                    <span>{incidencia.id}</span>
                    <span>{incidencia.descripcion}</span>
                    <span>{incidencia.prioridad}</span>
                    <span>{incidencia.estado}</span>

                    <Link
                      to={`/incidencias-urbanas/detalle-incidencia/${incidencia.id}`}
                      className="consultar-incidencias__more-btn"
                    >
                      Ver más
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="consultar-incidencias__map-container">
              <MapLocate width="100%" />
            </div>
          )}
        </div>
      </main>
    </>
  );
}