import { useState } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
import { Link } from "react-router";
import "../assets/css/ConsultarIncidencias.css";

export default function ConsultarIncidencias() {
  const [vista, setVista] = useState("lista");
  const [filtroEstado, setFiltroEstado] = useState("Todas");

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
    {
      id: 6,
      descripcion: "Alcantarilla atascada",
      prioridad: "Media",
      estado: "Creada",
    },
    {
      id: 7,
      descripcion: "Banco roto en el parque",
      prioridad: "Baja",
      estado: "En curso",
    },
  ];

  const totalIncidencias = incidencias.length;
  const totalCreadas = incidencias.filter((inc) => inc.estado === "Creada").length;
  const totalValidadas = incidencias.filter((inc) => inc.estado === "Validada").length;
  const totalAsignadas = incidencias.filter((inc) => inc.estado === "Asignada").length;
  const totalEnCurso = incidencias.filter((inc) => inc.estado === "En curso").length;
  const totalResueltas = incidencias.filter((inc) => inc.estado === "Resuelta").length;

  const incidenciasFiltradas =
    filtroEstado === "Todas"
      ? incidencias
      : incidencias.filter((incidencia) => incidencia.estado === filtroEstado);

  return (
    <>
      <Hero />
      <main className="consultar-incidencias__layout">
        <Sidebar />

        <div className="consultar-incidencias__content">
          <h2 className="consultar-incidencias__title">Consultar Incidencias</h2>

          <p className="consultar-incidencias__subtitle">
            Consulta toda la información relacionada con incidencias urbanas
          </p>

          <div className="consultar-incidencias__view-buttons">
            <button
              type="button"
              className={`consultar-incidencias__view-btn ${
                vista === "lista" ? "consultar-incidencias__view-btn--active" : ""
              }`}
              onClick={() => setVista("lista")}
            >
              Lista
            </button>

            <button
              type="button"
              className={`consultar-incidencias__view-btn ${
                vista === "mapa" ? "consultar-incidencias__view-btn--active" : ""
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
                filtroEstado === "Todas"
                  ? "consultar-incidencias__filter-btn--active"
                  : ""
              }`}
              onClick={() => setFiltroEstado("Todas")}
            >
              Todas ({totalIncidencias})
            </button>

            <button
              type="button"
              className={`consultar-incidencias__filter-btn ${
                filtroEstado === "Creada"
                  ? "consultar-incidencias__filter-btn--active"
                  : ""
              }`}
              onClick={() => setFiltroEstado("Creada")}
            >
              Creada ({totalCreadas})
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
              Validada ({totalValidadas})
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
              Asignada ({totalAsignadas})
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
              En curso ({totalEnCurso})
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
              Resuelta ({totalResueltas})
            </button>
          </div>

          {vista === "lista" ? (
            <div className="consultar-incidencias__table-wrapper">
              <table className="consultar-incidencias__table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Prioridad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {incidenciasFiltradas.map((incidencia) => (
                    <tr key={incidencia.id}>
                      <td>{incidencia.id}</td>
                      <td>{incidencia.descripcion}</td>
                      <td>
                        <span
                          className={`consultar-incidencias__estado-badge consultar-incidencias__estado-badge--${incidencia.estado
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {incidencia.estado}
                        </span>
                      </td>
                      <td>{incidencia.prioridad}</td>
                      <td>
                        <Link
                          to={`/incidencias-urbanas/detalle-incidencia/${incidencia.id}`}
                          className="consultar-incidencias__more-btn"
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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