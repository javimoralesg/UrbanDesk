import { useEffect, useMemo, useState } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
import { useParams, useNavigate } from "react-router";
import { api } from "../services/api";
import "../assets/css/DetalleIncidencia.css";

export default function DetalleIncidencia() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incidenciaApi, setIncidenciaApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const rol = "Operador"; // Operador | Tecnico | Ciudadano
  
  useEffect(() => {
    const cargarIncidencia = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await api.obtenerIncidenciaPorId(id);

        if (data && Object.keys(data).length > 0) {
          setIncidenciaApi(data);
        } else {
          setIncidenciaApi(null);
        }
      } catch (err) {
        console.error("Error al cargar incidencia:", err);
        if (err?.status === 404) {
          navigate("/incidencias-urbanas/no-match", { replace: true });
          return;
        }

        setError("No se pudo cargar la incidencia desde la API. Mostrando datos de ejemplo.");
        setIncidenciaApi(null);
      } finally {
        setLoading(false);
      }
    };

    cargarIncidencia();
  }, [id, navigate]);

  const incidencia = useMemo(() => {
    return incidenciaApi ;
  }, [incidenciaApi, id]);

  const estado = incidencia?.estado;
  const prioridad = incidencia?.prioridad;
  const descripcion = incidencia?.descripcion;
  const fechaCreacion = incidencia?.fechaCreacion;

  const ubicacion =incidencia?.ubicacion?.direccion;
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

  // Si la API no trae historial, construimos uno básico según estado
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

  const historial =
    incidencia?.historial && incidencia.historial.length > 0
      ? incidencia.historial
      : historialPorEstado;

  const historialOrdenado = [...historial].sort(
    (a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion)
  );

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    return new Date(fecha).toLocaleString("es-ES");
  };

  const validarIncidencia = async () => {
    try {
      await api.validarIncidencia(id, "Validada por el operador.");
      setIncidenciaApi((prev) => ({
        ...prev,
        estado: "VALIDADA",
        historial: [
          ...(prev.historial || []),
          {
            fechaCreacion: new Date().toISOString(),
            estadoNuevo: "VALIDADA",
            observaciones: "Validada por el operador.",
          },
        ],
      }));
    } catch (err) {
      console.error("Error al validar incidencia:", err);
      setError("No se pudo validar la incidencia. Inténtalo de nuevo.");
    }
  };

  const rechazarIncidencia = async () => {
    try {
      await api.rechazarIncidencia(id, "La incidencia ha sido rechazada por el operador.");
      setIncidenciaApi((prev) => ({
        ...prev,
        estado: "RECHAZADA",
        historial: [
          ...(prev.historial || []),
          {
            fechaCreacion: new Date().toISOString(),
            estadoNuevo: "RECHAZADA",
            observaciones: "Rechazada por el operador.",
          },
        ],
      }));
    } catch (err) {
      console.error("Error al rechazar incidencia:", err);
      setError("No se pudo rechazar la incidencia. Inténtalo de nuevo.");
    }
  };

  if (loading) {
    return (
      <>
        <Hero />
        <main className="detalle-incidencia__layout">
          <Sidebar />
          <section className="detalle-incidencia__content">
            <h2 className="detalle-incidencia__title">Incidencia #{id}</h2>
            <p>Cargando incidencia...</p>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
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
                .toLowerCase()
                .replaceAll("_", "-")}`}
            >
              {estadoLabel.toUpperCase()}
            </span>
          </div>

          <p className="detalle-incidencia__subtitle">
            Consulta toda la información relacionada con incidencias urbanas
          </p>

          {error && (
            <p className="detalle-incidencia__api-warning">
              {error}
            </p>
          )}

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

              {estado === "CREADA" && rol === "Operador" && (
                <div className="detalle-incidencia__actions">
                  <button onClick={() => validarIncidencia()}>
                    Validar
                  </button>
                  <button onClick={() => rechazarIncidencia()}>
                    Rechazar
                  </button>
                </div>
              )}

              {estado === "VALIDADA" && rol === "Operador" && (
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
                rol === "Operador" && (
                  <button className="detalle-incidencia__main-btn">
                    Editar asignación
                  </button>
                )}

              {estado === "RESUELTA" && rol === "Operador" && (
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
                <MapLocate width="100%" puntos={puntosMapa} />
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
                    <span>{formatearFecha(entrada.fechaCreacion)}</span>
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