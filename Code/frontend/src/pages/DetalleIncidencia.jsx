import { useEffect, useMemo, useState } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
import { useParams, useNavigate } from "react-router";
import { api } from "../services/api";
import "../assets/css/DetalleIncidencia.css";
import Popups from '../components/Popups';

export default function DetalleIncidencia() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incidencia, setIncidencia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [working, setWorking] = useState(null);
  const [success, setSuccess] = useState(null);

  const [prioridadSeleccionada, setPrioridadSeleccionada] = useState("SIN_ASIGNAR");
  const [observaciones, setObservaciones] = useState("");
const [formularioAbierto, setFormularioAbierto] = useState(null); 
// "validar" | "rechazar" | null
  const [incidenceList, setIncidenceList] = useState([]);


  const rol = useMemo(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return "";
    try {
      const user = JSON.parse(rawUser);
      return user?.rol?.toUpperCase?.() || "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    const verificarSesionYRedirigir = () => {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) {
        navigate("/incidencias-urbanas/login", { replace: true });
      }
    };

    const cargarIncidencia = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.obtenerIncidenciaPorId(id);

        if (data && Object.keys(data).length > 0) {
          setIncidencia(data);
        } else {
          setIncidencia(null);
        }
      } catch (err) {
        console.error("Error al cargar incidencia:", err);
        if (err?.status === 404) {
          navigate("/incidencias-urbanas/no-match", { replace: true });
          return;
        }

        setError("No se pudo cargar la incidencia desde la API. Mostrando datos de ejemplo.");
        setIncidencia(null);
      } finally {
        setLoading(false);
      }
    };

    verificarSesionYRedirigir();
    cargarIncidencia();
  }, [id, navigate]);

  useEffect(() => {
    if (loading) {
      setIncidenceList(prev => [...prev.filter(m => m.id !== 'loading'), { id: 'loading', message: 'Cargando incidencia', type: 'waiting' }]);
    }
    if (!loading) {
      setIncidenceList(prev => prev.filter(m => m.id !== 'loading'));
    }
    if (error) {
      setIncidenceList(prev => [...prev.filter(m => m.id !== 'error'), { id: 'error', message: error, type: 'error' }]);
      setTimeout(() => {
        setIncidenceList(prev => prev.filter(m => m.id !== 'error'));
        setError(null);
      }, 5000);
    }
    if (success) {
      setIncidenceList(prev => [...prev.filter(m => m.id !== 'success'), { id: 'success', message: success, type: 'success' }]);
      setTimeout(() => {
        setIncidenceList(prev => prev.filter(m => m.id !== 'success'));
        setSuccess(null);
      }, 5000);
    }
    if (working) {
      setIncidenceList(prev => [...prev.filter(m => m.id !== 'working'), { id: 'working', message: working, type: 'waiting' }]);
    }
    if (!working || success || error) {
      setIncidenceList(prev => prev.filter(m => m.id !== 'working'));
    }
  }, [loading, error, success, working]);


  const estado = incidencia?.estado;
  const prioridad = incidencia?.prioridad;
  const descripcion = incidencia?.descripcion;
  const fechaCreacion = incidencia?.fechaCreacion;

  const ubicacion = incidencia?.ubicacion?.direccion;
  const latitud = incidencia?.ubicacion?.latitud;
  const longitud = incidencia?.ubicacion?.longitud;

  const ciudadano =
    incidencia?.ciudadano?.nombre ||
    incidencia?.usuario?.nombre ||
    "Anónimo";

  const operadorAsignado =
    incidencia?.operador?.nombre ||
    incidencia?.operadorAsignado?.nombre ||
    "Operador Principal";

  const estadoLabel = {
    CREADA: "Creada",
    VALIDADA: "Validada",
    ASIGNADA: "Asignada",
    EN_CURSO: "En curso",
    RESUELTA: "Resuelta",
    RECHAZADA: "Rechazada",
    CERRADA: "Cerrada",
  }[estado] || estado;

  const prioridadLabel = {
    ALTA: "Alta",
    MEDIA: "Media",
    BAJA: "Baja",
    SIN_ASIGNAR: "Sin asignar",
  }[prioridad] || prioridad;

  const adjuntos = incidencia?.evidencias?.map((ev) => ev.url) || [];

  const puntosMapa =
    typeof latitud === "number" && typeof longitud === "number"
      ? [{ id: incidencia?.id ?? Number(id), lat: latitud, lng: longitud }]
      : [];

  const historialPorEstado = [
    {
      fechaCreacion: fechaCreacion || "2026-03-31T07:37:20",
      estadoNuevo: "CREADA",
      observaciones: "Incidencia reportada por ciudadano anónimo.",
    },
    ...(estado === "VALIDADA" ||
      estado === "ASIGNADA" ||
      estado === "EN_CURSO" ||
      estado === "RESUELTA"
      ? [
        {
          fechaCreacion: "2026-04-01T09:30:00",
          estadoNuevo: "VALIDADA",
          observaciones:
            "La incidencia ha sido revisada y validada por el operador.",
        },
      ]
      : []),
    ...(estado === "ASIGNADA" || estado === "EN_CURSO" || estado === "RESUELTA"
      ? [
        {
          fechaCreacion: "2026-04-01T12:00:00",
          estadoNuevo: "ASIGNADA",
          observaciones:
            "Incidencia asignada a los operarios correspondientes.",
        },
      ]
      : []),
    ...(estado === "EN_CURSO" || estado === "RESUELTA"
      ? [
        {
          fechaCreacion: "2026-04-02T08:15:00",
          estadoNuevo: "EN_CURSO",
          observaciones: "Los trabajos de intervención ya han comenzado.",
        },
      ]
      : []),
    ...(estado === "RESUELTA"
      ? [
        {
          fechaCreacion: "2026-04-02T16:45:00",
          estadoNuevo: "RESUELTA",
          observaciones:
            "La incidencia ha quedado resuelta correctamente.",
        },
      ]
      : []),
  ];

  const historial = useMemo(() => {
    const historialApi = incidencia?.historiales ?? incidencia?.historial ?? [];

    if (Array.isArray(historialApi) && historialApi.length > 0) {
      return historialApi;
    }

    return historialPorEstado;
  }, [incidencia, historialPorEstado]);

  const historialOrdenado = [...historial].sort(
  (a, b) =>
    new Date(a.fechaCambio || a.fechaCreacion || 0) -
    new Date(b.fechaCambio || b.fechaCreacion || 0)
);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    return new Date(fecha).toLocaleString("es-ES");
  };

  const validarIncidencia = async () => {
  if (prioridadSeleccionada === "SIN_ASIGNAR") {
    setError("Debes seleccionar una prioridad antes de validar.");
    return;
  }

  try {
    const data = await api.validarIncidencia(id, observaciones, prioridadSeleccionada);
    setSuccess("Incidencia validada correctamente.");
    setIncidencia(data);
    setFormularioAbierto(null);
    setObservaciones("");
    setPrioridadSeleccionada("SIN_ASIGNAR");
  } catch (err) {
    console.error("Error al validar incidencia:", err);
    setError("No se pudo validar la incidencia. Inténtalo de nuevo.");
  }
};

 const rechazarIncidencia = async () => {
  if (!observaciones.trim()) {
    setError("Debes indicar una observación antes de rechazar la incidencia.");
    return;
  }

  try {
    const data = await api.rechazarIncidencia(id, observaciones);
    setSuccess("Incidencia rechazada correctamente.");
    setIncidencia(data);
    setFormularioAbierto(null);
    setObservaciones("");
    setPrioridadSeleccionada("SIN_ASIGNAR");
  } catch (err) {
    console.error("Error al rechazar incidencia:", err);
    setError("No se pudo rechazar la incidencia. Inténtalo de nuevo.");
  } 
};


  return (
    <>
      <Popups list={incidenceList} />
      <Hero />

      <main className="detalle-incidencia__layout">
        <Sidebar />

        <section className="detalle-incidencia__content">
          <button
            className="detalle-incidencia__back"
            onClick={() => window.history.back()}
          >
            &lt; Volver
          </button>

          <div className="detalle-incidencia__header">
            <h2 className="detalle-incidencia__title">Incidencia #{id}</h2>

            <span
              className={`detalle-incidencia__estado-badge detalle-incidencia__estado-badge--${estado
                ?.toLowerCase()
                ?.replaceAll("_", "-") ?? "desconocido"}`}
            >
              {estadoLabel?.toUpperCase?.() ?? ""}
            </span>
          </div>

          <p className="detalle-incidencia__subtitle">
            Consulta toda la información relacionada con incidencias urbanas
          </p>

          <div className="detalle-incidencia__top">
            <div className="detalle-incidencia__card">
              <h3 className="detalle-incidencia__section-title">
                Información General
              </h3>

              <div className="detalle-incidencia__info">
                <div className="detalle-incidencia__field">
                  <span className="detalle-incidencia__field-label">
                    Descripción:
                  </span>
                  <div className="detalle-incidencia__field-value">
                    {descripcion}
                  </div>
                </div>

                <div className="detalle-incidencia__field">
                  <span className="detalle-incidencia__field-label">
                    Prioridad:
                  </span>
                  <div className="detalle-incidencia__field-value">
                    {estado === "CREADA" ? "SIN_ASIGNAR" : prioridadLabel}
                  </div>
                </div>

                <div className="detalle-incidencia__field">
                  <span className="detalle-incidencia__field-label">
                    Fecha de creación:
                  </span>
                  <div className="detalle-incidencia__field-value">
                    {formatearFecha(fechaCreacion)}
                  </div>
                </div>

                <div className="detalle-incidencia__field">
                  <span className="detalle-incidencia__field-label">
                    Ciudadano:
                  </span>
                  <div className="detalle-incidencia__field-value">
                    {ciudadano}
                  </div>
                </div>

                <div className="detalle-incidencia__field">
                  <span className="detalle-incidencia__field-label">
                    Operador Asignado:
                  </span>
                  <div className="detalle-incidencia__field-value">
                    {operadorAsignado}
                  </div>
                </div>
              </div>

              {estado === "CREADA" && rol === "OPERADOR" && (
  <>
    <div className="detalle-incidencia__actions">
      <button
        className="detalle-incidencia__main-btn"
        onClick={() =>
          setFormularioAbierto((prev) => (prev === "validar" ? null : "validar"))
        }
      >
        Validar incidencia
      </button>

      <button
        className="detalle-incidencia__main-btn detalle-incidencia__main-btn--danger"
        onClick={() =>
          setFormularioAbierto((prev) => (prev === "rechazar" ? null : "rechazar"))
        }
      >
        Rechazar incidencia
      </button>
    </div>

    {formularioAbierto === "validar" && (
      <div className="detalle-incidencia__form-card">
        <h4 className="detalle-incidencia__form-title">Validar incidencia</h4>

        <div className="detalle-incidencia__form-group">
          <label>Prioridad</label>
          <select
            value={prioridadSeleccionada}
            onChange={(e) => setPrioridadSeleccionada(e.target.value)}
          >
            <option value="SIN_ASIGNAR">Sin asignar</option>
            <option value="URGENTE">Urgente</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </select>
        </div>

        <div className="detalle-incidencia__form-group">
          <label>Observaciones</label>
          <textarea
            placeholder="Añade observaciones sobre la validación..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <div className="detalle-incidencia__actions">
          <button onClick={validarIncidencia}>
            Confirmar validación
          </button>
          <button
            type="button"
            onClick={() => {
              setFormularioAbierto(null);
              setObservaciones("");
              setPrioridadSeleccionada("SIN_ASIGNAR");
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    )}

    {formularioAbierto === "rechazar" && (
      <div className="detalle-incidencia__form-card">
        <h4 className="detalle-incidencia__form-title">Rechazar incidencia</h4>

        <div className="detalle-incidencia__form-group">
          <label>Observaciones</label>
          <textarea
            placeholder="Indica el motivo del rechazo..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <div className="detalle-incidencia__actions">
          <button onClick={rechazarIncidencia}>
            Confirmar rechazo
          </button>
          <button
            type="button"
            onClick={() => {
              setFormularioAbierto(null);
              setObservaciones("");
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    )}
  </>
)}

              {estado === "VALIDADA" && rol === "OPERADOR" && (
                <>
                  <div className="detalle-incidencia__asignacion">
                    <div>
                      Jardinero <button className="delete">Eliminar</button>
                    </div>
                    <div>
                      Fontanero <button className="delete">Eliminar</button>
                    </div>
                    <div>
                      Electricista <button className="delete">Eliminar</button>
                    </div>
                    <div>
                      Pintor <button className="add">Añadir</button>
                    </div>
                    <div>
                      Albañil <button className="add">Añadir</button>
                    </div>
                  </div>

                  <button className="detalle-incidencia__main-btn">
                    Asignar
                  </button>
                </>
              )}

              {(estado === "ASIGNADA" || estado === "EN_CURSO") &&
                rol === "OPERADOR" && (
                  <button className="detalle-incidencia__main-btn">
                    Editar asignación
                  </button>
                )}

              {estado === "RESUELTA" && rol === "OPERADOR" && (
                <button className="detalle-incidencia__main-btn">
                  Cerrar incidencia
                </button>
              )}
            </div>

            <div className="detalle-incidencia__card">
              <h3 className="detalle-incidencia__section-title">Ubicación</h3>

              <p className="detalle-incidencia__ubicacion-texto">
                {ubicacion}
              </p>

              <div className="detalle-incidencia__map">
                <MapLocate width="100%" height="100%" puntos={puntosMapa} />
              </div>
            </div>
          </div>

          <div className="detalle-incidencia__section">
            <h3>Adjuntos</h3>

            <div className="detalle-incidencia__attachments">
              {adjuntos.length > 0 ? (
                adjuntos.map((adjunto, index) => (
                  <img
                    key={index}
                    src={adjunto}
                    alt={`Adjunto ${index + 1} de la incidencia`}
                    className="detalle-incidencia__attachment-image"
                  />
                ))
              ) : (
                <p>No hay adjuntos disponibles.</p>
              )}
            </div>
          </div>

          <div className="detalle-incidencia__section">
            <h3>Historial</h3>

            <div className="detalle-incidencia__history">
              {historialOrdenado.map((entrada, index) => (
                <div
                  key={index}
                  className="entrada-de-historial-con-display-flex"
                >
                  <div className="circulo"></div>

                  <div className="contenedor-de-informacion">
                    <span>{formatearFecha(entrada.fechaCambio || entrada.fechaCreacion)}</span>
                    <strong>
                      {entrada.estadoNuevo?.replaceAll("_", " ")}
                    </strong>
                    <p>{entrada.observaciones}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}