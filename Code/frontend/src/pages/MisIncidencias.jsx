import { useEffect, useMemo, useState } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
import { Link, useNavigate } from "react-router";
import { api } from "../services/api";
import "../assets/css/MisIncidencias.css";
import Popups from '../components/Popups';


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

const ORDEN_ESTADOS = {
  CREADA: 1,
  VALIDADA: 2,
  ASIGNADA: 3,
  EN_CURSO: 4,
  RESUELTA: 5,
  CERRADA: 6,
  RECHAZADA: 7,
};

const ORDEN_PRIORIDADES = {
  URGENTE: 1,
  ALTA: 2,
  MEDIA: 3,
  BAJA: 4,
  SIN_ASIGNAR: 5,
};

const ordenarIncidencias = (incidencias) => {
  return [...incidencias].sort((a, b) => {
    // Primero por estado
    const ordenEstadoA = ORDEN_ESTADOS[a.estado] || 99;
    const ordenEstadoB = ORDEN_ESTADOS[b.estado] || 99;
    if (ordenEstadoA !== ordenEstadoB) {
      return ordenEstadoA - ordenEstadoB;
    }

    // Luego por prioridad
    const ordenPrioridadA = ORDEN_PRIORIDADES[a.prioridad] || 99;
    const ordenPrioridadB = ORDEN_PRIORIDADES[b.prioridad] || 99;
    if (ordenPrioridadA !== ordenPrioridadB) {
      return ordenPrioridadA - ordenPrioridadB;
    }

    // Finalmente por fecha de creación (más nueva primero)
    const fechaA = new Date(a.fechaCreacion || 0).getTime();
    const fechaB = new Date(b.fechaCreacion || 0).getTime();
    return fechaA - fechaB;
  });
};

export default function MisIncidencias() {
  const [vista, setVista] = useState("lista");
  const [filtroEstado, setFiltroEstado] = useState("TODAS");
  const [misIncidencias, setMisIncidencias] = useState([]);
  const [rolUsuario, setRolUsuario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const [incidenceList, setIncidenceList] = useState([]);

  useEffect(() => {
    if (loading) {
      setIncidenceList(prev => ([...prev, { id: 'loading', message: 'Cargando incidencias', type: 'waiting' }]));
    }
    if (!loading) {
      setIncidenceList(prev => prev.filter(m => m.id !== 'loading'));
    }
    if (error) {
      setIncidenceList(prev => ([...prev, { id: 'error', message: error, type: 'error' }]));
      setTimeout(() => {
        setIncidenceList(prev => prev.filter(m => m.id !== 'error'));
        setError(null);
      }, 5000);
    }
  }, [loading, error]);

  useEffect(() => {
    const verificarSesionYRedirigir = () => {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) {
        navigate("/incidencias-urbanas/login");
      }
    };

    const cargarMisIncidencias = async () => {
      try {
        setLoading(true);
        setError(null);

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

        data = await api.getIncidents();

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

    verificarSesionYRedirigir();
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

  const incidenciasFiltradas = useMemo(() => {
    const filtradas =
      filtroEstado === "TODAS"
        ? misIncidencias
        : misIncidencias.filter((inc) => inc.estado === filtroEstado);
    return ordenarIncidencias(filtradas);
  }, [filtroEstado, misIncidencias]);

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
      <Popups list={incidenceList} />
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
              className={`mis-incidencias__view-btn ${vista === "lista" ? "mis-incidencias__view-btn--active" : ""
                }`}
              onClick={() => setVista("lista")}
            >
              Lista
            </button>

            <button
              type="button"
              className={`mis-incidencias__view-btn ${vista === "mapa" ? "mis-incidencias__view-btn--active" : ""
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
                className={`mis-incidencias__filter-btn ${filtroEstado === filtro.key
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
                          to={`/incidencias-urbanas/mis-incidencias/${incidencia.id}`}
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
              <MapLocate width="100%" puntos={puntosMapa} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}