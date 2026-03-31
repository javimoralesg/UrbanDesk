import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
import "../assets/css/MisIncidencias.css";

import { useState } from "react";

import { Link } from "react-router";

export default function ConsultarIncidencias() {
  const [vista, setVista] = useState("lista");
  const [filtroEstado, setFiltroEstado] = useState("Creada");


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
              <button
                type="button"
                className={`consultar-incidencias__filter-btn ${
                  filtroEstado === "Creada"
                    ? "consultar-incidencias__filter-btn--active"
                    : ""
                }`}
                onClick={() => setFiltroEstado("Creada")}
              >
                Creada
              </button>

              <button
                type="button"
                className={`consultar-incidencias__filter-btn ${
                  filtroEstado === "Validada"
                    ? "consultar-incidencias__filter-btn--active"
                    : ""
                }`}
                onClick={() => setFiltroEstado("Validada")}
              >
                Validada
              </button>

              <button
                type="button"
                className={`consultar-incidencias__filter-btn ${
                  filtroEstado === "Asignada"
                    ? "consultar-incidencias__filter-btn--active"
                    : ""
                }`}
                onClick={() => setFiltroEstado("Asignada")}
              >
                Asignada
              </button>

              <button
                type="button"
                className={`consultar-incidencias__filter-btn ${
                  filtroEstado === "En curso"
                    ? "consultar-incidencias__filter-btn--active"
                    : ""
                }`}
                onClick={() => setFiltroEstado("En curso")}
              >
                En curso
              </button>

              <button
                type="button"
                className={`consultar-incidencias__filter-btn ${
                  filtroEstado === "Resuelta"
                    ? "consultar-incidencias__filter-btn--active"
                    : ""
                }`}
                onClick={() => setFiltroEstado("Resuelta")}
              >
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
                {incidenciasFiltradas.map((incidencia) => (
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