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
  const [persistentError, setPersistentError] = useState(null);

  const navigate = useNavigate();

  const [incidenceList, setIncidenceList] = useState([]);

  useEffect(() => {
    setIncidenceList(prev => {
      let next = [...prev];
      if (loading) {
        if (!next.find(m => m.id === 'loading')) {
          next.push({ id: 'loading', message: 'Cargando incidencias', type: 'waiting' });
        }
      } else {
        next = next.filter(m => m.id !== 'loading');
      }

      if (persistentError) {
        if (!next.find(m => m.id === 'persistent_error')) {
          next.push({ id: 'persistent_error', message: persistentError, type: 'error' });
        } else {
          next = next.map(m => m.id === 'persistent_error' ? { ...m, message: persistentError } : m);
        }
      } else {
        next = next.filter(m => m.id !== 'persistent_error');
      }

      return next;
    });
  }, [loading, persistentError]);

  useEffect(() => {
    if (error) {
      setIncidenceList(prev => {
        let next = [...prev];
        if (!next.find(m => m.id === 'error')) {
          next.push({ id: 'error', message: error, type: 'error' });
        } else {
          next = next.map(m => m.id === 'error' ? { ...m, message: error } : m);
        }
        return next;
      });
      setLoading(false);
      setIncidenceList(prev => prev.filter(m => m.id !== 'loading'));
      setTimeout(() => {
        setIncidenceList(prev => prev.filter(m => m.id !== 'error'));
        setError(null);
      }, 5000);
    }
  }, [error]);

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
          setMisIncidencias([]);
          setError("No se encontró sesión para obtener datos.");
          return;
        }

        let user;
        try {
          user = JSON.parse(rawUser);
        } catch {
          setMisIncidencias([]);
          setError("No se pudo leer la sesión para obtener datos.");
          return;
        }

        if (!user?.id) {
          setMisIncidencias([]);
          setError("No se encontró el id del usuario.");
          return;
        }

        setRolUsuario(user.rol || "");

        const data = await api.getIncidents();

        if (Array.isArray(data)) {
          setMisIncidencias(data);
          setPersistentError(null);
        } else {
          setMisIncidencias([]);
          setPersistentError("No se obtuvieron incidencias del servidor.");
        }
      } catch (err) {
        console.error("Error al cargar mis incidencias:", err);
        setMisIncidencias([]);
        setError("Error de red: No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    verificarSesionYRedirigir();
    cargarMisIncidencias();
  }, []);

  const idUsuario = useMemo(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      const u = JSON.parse(raw);
      return u?.id || null;
    } catch {
      return null;
    }
  }, []);

  const getEstadoParaUsuario = (inc) => {
    if (rolUsuario === "TECNICO" && idUsuario) {
      const idU = Number(idUsuario);
      const asignado = Array.isArray(inc?.tecnicos) && inc.tecnicos.some((t) => Number(t?.id) === idU);
      if (asignado) {
        const finalizados = (inc?.tecnicosFinalizadosIds || []).map(Number);
        if (finalizados.includes(idU)) return "RESUELTA";

        const historialApi = inc?.historiales ?? inc?.historial ?? [];
        if (Array.isArray(historialApi)) {
          const historialTec = historialApi
            .filter((entrada) => Number(entrada?.usuario?.id) === idU)
            .sort(
              (a, b) =>
                new Date(b?.fechaCambio || b?.fechaCreacion || 0) -
                new Date(a?.fechaCambio || a?.fechaCreacion || 0)
            );

          const ultima = historialTec.find((e) => !!e);
          const observ = (ultima?.observaciones || "").toLowerCase();
          if (observ.includes("ha aceptado la incidencia") || (ultima?.estadoNuevo === "EN_CURSO")) {
            return "EN_CURSO";
          }
        }

        return "ASIGNADA";
      }
    }

    return inc.estado;
  };

  const totalTodas = misIncidencias.length;
  const totalCreadas = misIncidencias.filter((inc) => getEstadoParaUsuario(inc) === "CREADA").length;
  const totalValidadas = misIncidencias.filter((inc) => getEstadoParaUsuario(inc) === "VALIDADA").length;
  const totalAsignadas = misIncidencias.filter((inc) => getEstadoParaUsuario(inc) === "ASIGNADA").length;
  const totalEnCurso = misIncidencias.filter((inc) => getEstadoParaUsuario(inc) === "EN_CURSO").length;
  const totalResueltas = misIncidencias.filter((inc) => getEstadoParaUsuario(inc) === "RESUELTA").length;


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
    ];
  }, [
    rolUsuario,
    totalTodas,
    totalCreadas,
    totalValidadas,
    totalAsignadas,
    totalEnCurso,
    totalResueltas,
  ]);

  useEffect(() => {
    if (misIncidencias.length === 0 && !loading) {
     setPersistentError("No se han encontrado incidencias públicas.");
    }
  }, [misIncidencias]);

  const incidenciasFiltradas = useMemo(() => {
    const filtradas = misIncidencias.filter((inc) => {
      const estadoReal = getEstadoParaUsuario(inc);
      return filtroEstado === "TODAS" ? true : estadoReal === filtroEstado;
    });
    return ordenarIncidencias(filtradas);
  }, [filtroEstado, misIncidencias, rolUsuario, idUsuario]);

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
                {filtro.label} {filtro.total > 0 && `(${filtro.total})`}
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
                          className={`mis-incidencias__estado-badge mis-incidencias__estado-badge--${getEstadoParaUsuario(incidencia)
                            .toLowerCase()
                            .replaceAll("_", "-")}`}
                        >
                          {ESTADOS_LABELS[getEstadoParaUsuario(incidencia)] || getEstadoParaUsuario(incidencia)}
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