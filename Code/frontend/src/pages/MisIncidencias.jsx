import { useEffect, useMemo, useState } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
import { Link } from "react-router";
import { api } from "../services/api";
import "../assets/css/MisIncidencias.css";

const ESTADOS_LABELS = {
  CREADA: "Creada",
  VALIDADA: "Validada",
  ASIGNADA: "Asignada",
  EN_CURSO: "En curso",
  RESUELTA: "Resuelta",
  CERRADA: "Cerrada",
  RECHAZADA: "Rechazada",
};

const MIS_INCIDENCIAS_MOCK = [
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
    descripcion: "Papelera rota en el parque",
    prioridad: "Media",
    estado: "RECHAZADA",
    ubicacion: { latitud: 40.4148, longitud: -3.7062 },
  },
  {
    id: 7,
    descripcion: "Acera levantada",
    prioridad: "Baja",
    estado: "CERRADA",
    ubicacion: { latitud: 40.4201, longitud: -3.707 },
  },
];

export default function MisIncidencias() {
  const [vista, setVista] = useState("lista");
  const [filtroEstado, setFiltroEstado] = useState("TODAS");
  const [misIncidencias, setMisIncidencias] = useState([]);
  const [rolUsuario, setRolUsuario] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarMisIncidencias = async () => {
      try {
        setLoading(true);
        setError("");

        const rawUser = localStorage.getItem("user");
        if (!rawUser) {
          setMisIncidencias(MIS_INCIDENCIAS_MOCK);
          setError("No se encontró sesión. Mostrando incidencias de ejemplo.");
          return;
        }

        let user;
        try {
          user = JSON.parse(rawUser);
        } catch {
          setMisIncidencias(MIS_INCIDENCIAS_MOCK);
          setError("No se pudo leer la sesión. Mostrando incidencias de ejemplo.");
          return;
        }

        if (!user?.id) {
          setMisIncidencias(MIS_INCIDENCIAS_MOCK);
          setError("No se encontró el id del usuario. Mostrando incidencias de ejemplo.");
          return;
        }

        const rol = user?.rol?.toUpperCase?.() || "";
        setRolUsuario(rol);

        let data = [];

        if (rol === "OPERADOR") {
          data = await api.obtenerIncidenciasPorOperador(user.id);
        } else if (rol === "TECNICO") {
          data = await api.obtenerIncidenciasPorTecnico(user.id);
        } else if (rol === "CIUDADANO") {
          data = await api.obtenerIncidenciasPorCiudadano(user.id);
        }

        if (Array.isArray(data) && data.length > 0) {
          setMisIncidencias(data);
        } else {
          setMisIncidencias(MIS_INCIDENCIAS_MOCK);
          setError("La API no devolvió incidencias. Mostrando incidencias de ejemplo.");
        }
      } catch (err) {
        console.error("Error al cargar mis incidencias:", err);
        setMisIncidencias(MIS_INCIDENCIAS_MOCK);
        setError("No se pudieron cargar tus incidencias desde la API. Mostrando incidencias de ejemplo.");
      } finally {
        setLoading(false);
      }
    };

    cargarMisIncidencias();
  }, []);

  const totalTodas = misIncidencias.length;
  const totalCreadas = misIncidencias.filter((inc) => inc.estado === "CREADA").length;
  const totalValidadas = misIncidencias.filter((inc) => inc.estado === "VALIDADA").length;
  const totalAsignadas = misIncidencias.filter((inc) => inc.estado === "ASIGNADA").length;
  const totalEnCurso = misIncidencias.filter((inc) => inc.estado === "EN_CURSO").length;
  const totalResueltas = misIncidencias.filter((inc) => inc.estado === "RESUELTA").length;
  const totalCerradas = misIncidencias.filter((inc) => inc.estado === "CERRADA").length;
  const totalRechazadas = misIncidencias.filter((inc) => inc.estado === "RECHAZADA").length;

  const filtrosVisibles = useMemo(() => {
    if (rolUsuario === "TECNICO") {
      return [
        { key: "TODAS", label: "Todas", total: totalTodas },
        { key: "ASIGNADA", label: "Asignada", total: totalAsignadas },
        { key: "EN_CURSO", label: "En curso", total: totalEnCurso },
      ];
    }

    return [
      { key: "TODAS", label: "Todas", total: totalTodas },
      { key: "CREADA", label: "Creada", total: totalCreadas },
      { key: "VALIDADA", label: "Validada", total: totalValidadas },
      { key: "ASIGNADA", label: "Asignada", total: totalAsignadas },
      { key: "EN_CURSO", label: "En curso", total: totalEnCurso },
      { key: "RESUELTA", label: "Resuelta", total: totalResueltas },
      { key: "CERRADA", label: "Cerrada", total: totalCerradas },
      { key: "RECHAZADA", label: "Rechazada", total: totalRechazadas },
    ];
  }, [
    rolUsuario,
    totalTodas,
    totalCreadas,
    totalValidadas,
    totalAsignadas,
    totalEnCurso,
    totalResueltas,
    totalCerradas,
    totalRechazadas,
  ]);

  const incidenciasFiltradas =
    filtroEstado === "TODAS"
      ? misIncidencias
      : misIncidencias.filter((inc) => inc.estado === filtroEstado);

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
      <main className="mis-incidencias__layout">
        <Sidebar />

        <div className="mis-incidencias__content">
          <h2 className="mis-incidencias__title">Mis Incidencias</h2>

          <p className="mis-incidencias__subtitle">
            Consulta todas las incidencias asociadas a tu usuario y revisa su estado
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
            {filtrosVisibles.map((filtro) => (
              <button
                key={filtro.key}
                type="button"
                className={`mis-incidencias__filter-btn ${
                  filtroEstado === filtro.key
                    ? "mis-incidencias__filter-btn--active"
                    : ""
                }`}
                onClick={() => setFiltroEstado(filtro.key)}
              >
                {filtro.label} ({filtro.total})
              </button>
            ))}
          </div>

          {loading ? (
            <p>Cargando incidencias...</p>
          ) : vista === "lista" ? (
            <div className="mis-incidencias__table-wrapper">
              {error && <p>{error}</p>}

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
                            .replaceAll("_", "-")}`}
                        >
                          {ESTADOS_LABELS[incidencia.estado] || incidencia.estado}
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
              {error && <p>{error}</p>}
              <MapLocate width="100%" puntos={puntosMapa} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}