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

const INCIDENCIAS_MOCK = [
  {
    id: 1,
    descripcion: "Farola rota en la calle principal",
    prioridad: "Alta",
    estado: "CREADA",
    ubicacion: { latitud: 40.4168, longitud: -3.7038 },
  },
  {
    id: 2,
    descripcion: "Bache en la calzada",
    prioridad: "Media",
    estado: "VALIDADA",
    ubicacion: { latitud: 40.4175, longitud: -3.7045 },
  },
  {
    id: 3,
    descripcion: "Contenedor desbordado",
    prioridad: "Baja",
    estado: "ASIGNADA",
    ubicacion: { latitud: 40.4182, longitud: -3.7051 },
  },
  {
    id: 4,
    descripcion: "Señal de tráfico dañada",
    prioridad: "Alta",
    estado: "EN_CURSO",
    ubicacion: { latitud: 40.419, longitud: -3.7029 },
  },
  {
    id: 5,
    descripcion: "Fuga de agua en acera",
    prioridad: "Alta",
    estado: "RESUELTA",
    ubicacion: { latitud: 40.4159, longitud: -3.7018 },
  },
  {
    id: 6,
    descripcion: "Alcantarilla atascada",
    prioridad: "Media",
    estado: "CREADA",
    ubicacion: { latitud: 40.4148, longitud: -3.7062 },
  },
  {
    id: 7,
    descripcion: "Banco roto en el parque",
    prioridad: "Baja",
    estado: "EN_CURSO",
    ubicacion: { latitud: 40.4201, longitud: -3.707 },
  },
];

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
        setError("");

        const rawUser = localStorage.getItem("user");
        if (!rawUser) {
          setIncidencias(INCIDENCIAS_MOCK);
          setError("No se encontró sesión. Mostrando incidencias de ejemplo.");
          return;
        }

        let user;
        try {
          user = JSON.parse(rawUser);
        } catch {
          setIncidencias(INCIDENCIAS_MOCK);
          setError("No se pudo leer la sesión. Mostrando incidencias de ejemplo.");
          return;
        }

        if (!user?.id) {
          setIncidencias(INCIDENCIAS_MOCK);
          setError("No se encontró el id del usuario. Mostrando incidencias de ejemplo.");
          return;
        }

        let data = [];
        if (user.rol === "OPERADOR") {
          data = await api.obtenerIncidenciasPorOperador(user.id);
        } else {
          data = await api.obtenerIncidenciasPorCiudadano(user.id);
        }

        if (Array.isArray(data) && data.length > 0) {
          setIncidencias(data);
        } else {
          setIncidencias(INCIDENCIAS_MOCK);
          setError("La API no devolvió incidencias. Mostrando incidencias de ejemplo.");
        }
      } catch (error) {
        console.error(error);
        setIncidencias(INCIDENCIAS_MOCK);
        setError("No se pudieron cargar tus incidencias desde la API. Mostrando incidencias de ejemplo.");
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

  const puntosMapa = incidenciasFiltradas
    .filter(
      (incidencia) =>
        typeof incidencia?.ubicacion?.latitud === "number" &&
        typeof incidencia?.ubicacion?.longitud === "number"
    )
    .map((incidencia) => ({
      id: incidencia.id,
      lat: incidencia.ubicacion.latitud,
      lng: incidencia.ubicacion.longitud,
    }));

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
          ) : vista === "lista" ? (
            <div className="consultar-incidencias__table-wrapper">
              {error && <p>{error}</p>}

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
              {error && <p>{error}</p>}
              <MapLocate width="100%" puntos={puntosMapa} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}