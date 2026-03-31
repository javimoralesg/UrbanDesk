import { useState } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
import { Link } from "react-router";
import "../assets/css/MisIncidencias.css";

export default function MisIncidencias() {
  const [vista, setVista] = useState("lista");
  const [filtroEstado, setFiltroEstado] = useState("Todas");

  // Simulación temporal. Luego esto vendrá del backend
  const misIncidencias = [
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
      descripcion: "Papelera rota en el parque",
      prioridad: "Media",
      estado: "Rechazada",
    },
    {
      id: 7,
      descripcion: "Acera levantada",
      prioridad: "Baja",
      estado: "Cerrada",
    },
  ];

  const totalTodas = misIncidencias.length;
  const totalCreadas = misIncidencias.filter((inc) => inc.estado === "Creada").length;
  const totalValidadas = misIncidencias.filter((inc) => inc.estado === "Validada").length;
  const totalAsignadas = misIncidencias.filter((inc) => inc.estado === "Asignada").length;
  const totalEnCurso = misIncidencias.filter((inc) => inc.estado === "En curso").length;
  const totalResueltas = misIncidencias.filter((inc) => inc.estado === "Resuelta").length;
  const totalCerradas = misIncidencias.filter((inc) => inc.estado === "Cerrada").length;
  const totalRechazadas = misIncidencias.filter((inc) => inc.estado === "Rechazada").length;

  const incidenciasFiltradas =
    filtroEstado === "Todas"
      ? misIncidencias
      : misIncidencias.filter((inc) => inc.estado === filtroEstado);

  return (
    <>
      <Hero />
      <main className="mis-incidencias__layout">
        <Sidebar />

        <div className="mis-incidencias__content">
          <h2 className="mis-incidencias__title">Mis Incidencias</h2>

          <p className="mis-incidencias__subtitle">
            Consulta todas las incidencias que has creado y revisa su estado
          </p>

          <div className="mis-incidencias__view-buttons">
            <button
              type="button"
              className={`mis-incidencias__view-btn ${
                vista === "lista" ? "mis-incidencias__view-btn--active" : ""
              }`}
              onClick={() => setVista("lista")}
            >
              Lista
            </button>

            <button
              type="button"
              className={`mis-incidencias__view-btn ${
                vista === "mapa" ? "mis-incidencias__view-btn--active" : ""
              }`}
              onClick={() => setVista("mapa")}
            >
              Mapa
            </button>
          </div>

          <div className="mis-incidencias__filters">
            <button
              type="button"
              className={`mis-incidencias__filter-btn ${
                filtroEstado === "Todas" ? "mis-incidencias__filter-btn--active" : ""
              }`}
              onClick={() => setFiltroEstado("Todas")}
            >
              Todas ({totalTodas})
            </button>

            <button
              type="button"
              className={`mis-incidencias__filter-btn ${
                filtroEstado === "Creada" ? "mis-incidencias__filter-btn--active" : ""
              }`}
              onClick={() => setFiltroEstado("Creada")}
            >
              Creada ({totalCreadas})
            </button>

            <button
              type="button"
              className={`mis-incidencias__filter-btn ${
                filtroEstado === "Validada" ? "mis-incidencias__filter-btn--active" : ""
              }`}
              onClick={() => setFiltroEstado("Validada")}
            >
              Validada ({totalValidadas})
            </button>

            <button
              type="button"
              className={`mis-incidencias__filter-btn ${
                filtroEstado === "Asignada" ? "mis-incidencias__filter-btn--active" : ""
              }`}
              onClick={() => setFiltroEstado("Asignada")}
            >
              Asignada ({totalAsignadas})
            </button>

            <button
              type="button"
              className={`mis-incidencias__filter-btn ${
                filtroEstado === "En curso" ? "mis-incidencias__filter-btn--active" : ""
              }`}
              onClick={() => setFiltroEstado("En curso")}
            >
              En curso ({totalEnCurso})
            </button>

            <button
              type="button"
              className={`mis-incidencias__filter-btn ${
                filtroEstado === "Resuelta" ? "mis-incidencias__filter-btn--active" : ""
              }`}
              onClick={() => setFiltroEstado("Resuelta")}
            >
              Resuelta ({totalResueltas})
            </button>

            <button
              type="button"
              className={`mis-incidencias__filter-btn ${
                filtroEstado === "Cerrada" ? "mis-incidencias__filter-btn--active" : ""
              }`}
              onClick={() => setFiltroEstado("Cerrada")}
            >
              Cerrada ({totalCerradas})
            </button>

            <button
              type="button"
              className={`mis-incidencias__filter-btn ${
                filtroEstado === "Rechazada" ? "mis-incidencias__filter-btn--active" : ""
              }`}
              onClick={() => setFiltroEstado("Rechazada")}
            >
              Rechazada ({totalRechazadas})
            </button>
          </div>

          {vista === "lista" ? (
            <div className="mis-incidencias__table-wrapper">
              <table className="mis-incidencias__table">
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
                          className={`mis-incidencias__estado-badge mis-incidencias__estado-badge--${incidencia.estado
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
                          className="mis-incidencias__more-btn"
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
            <div className="mis-incidencias__map-container">
              <MapLocate width="100%" />
            </div>
          )}
        </div>
      </main>
    </>
  );
}