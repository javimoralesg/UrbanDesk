import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
import { Link } from "react-router";
import { api } from "../services/api";
import "../assets/css/ConsultarIncidencias.css";

const ESTADOS_LABELS = {
  CREADA: "Creada",
  VALIDADA: "Validada",
  ASIGNADA: "Asignada",
  EN_CURSO: "En curso",
  RESUELTA: "Resuelta",
  CERRADA: "Cerrada",
  RECHAZADA: "Rechazada",
};

export default function ConsultarIncidencias() {
  const [vista, setVista] = useState("lista");
  const [filtroEstado, setFiltroEstado] = useState("TODAS");
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarIncidencias = async () => {
      try {
        setLoading(true);
        const data = await api.obtenerTodasIncidencias();
        setIncidencias(data);
      } catch (error) {
        console.error(error);
        setError("No se pudieron cargar las incidencias");
      } finally {
        setLoading(false);
      }
    };

    cargarIncidencias();
  }, []);

  const totalIncidencias = incidencias.length;
  const totalCreadas = incidencias.filter((inc) => inc.estado === "CREADA").length;
  const totalValidadas = incidencias.filter((inc) => inc.estado === "VALIDADA").length;
  const totalAsignadas = incidencias.filter((inc) => inc.estado === "ASIGNADA").length;
  const totalEnCurso = incidencias.filter((inc) => inc.estado === "EN_CURSO").length;
  const totalResueltas = incidencias.filter((inc) => inc.estado === "RESUELTA").length;

  const incidenciasFiltradas =
    filtroEstado === "TODAS"
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
                filtroEstado === "TODAS"
                  ? "consultar-incidencias__filter-btn--active"
                  : ""
              }`}
              onClick={() => setFiltroEstado("TODAS")}
            >
              Todas ({totalIncidencias})
            </button>

            <button
              type="button"
              className={`consultar-incidencias__filter-btn ${
                filtroEstado === "CREADA"
                  ? "consultar-incidencias__filter-btn--active"
                  : ""
              }`}
              onClick={() => setFiltroEstado("CREADA")}
            >
              Creada ({totalCreadas})
            </button>

            <button
              type="button"
              className={`consultar-incidencias__filter-btn ${
                filtroEstado === "VALIDADA"
                  ? "consultar-incidencias__filter-btn--active"
                  : ""
              }`}
              onClick={() => setFiltroEstado("VALIDADA")}
            >
              Validada ({totalValidadas})
            </button>

            <button
              type="button"
              className={`consultar-incidencias__filter-btn ${
                filtroEstado === "ASIGNADA"
                  ? "consultar-incidencias__filter-btn--active"
                  : ""
              }`}
              onClick={() => setFiltroEstado("ASIGNADA")}
            >
              Asignada ({totalAsignadas})
            </button>

            <button
              type="button"
              className={`consultar-incidencias__filter-btn ${
                filtroEstado === "EN_CURSO"
                  ? "consultar-incidencias__filter-btn--active"
                  : ""
              }`}
              onClick={() => setFiltroEstado("EN_CURSO")}
            >
              En curso ({totalEnCurso})
            </button>

            <button
              type="button"
              className={`consultar-incidencias__filter-btn ${
                filtroEstado === "RESUELTA"
                  ? "consultar-incidencias__filter-btn--active"
                  : ""
              }`}
              onClick={() => setFiltroEstado("RESUELTA")}
            >
              Resuelta ({totalResueltas})
            </button>
          </div>

          {loading ? (
            <p>Cargando incidencias...</p>
          ) : error ? (
            <p>{error}</p>
          ) : vista === "lista" ? (
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
                            .replaceAll("_", "-")}`}
                        >
                          {ESTADOS_LABELS[incidencia.estado] || incidencia.estado}
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