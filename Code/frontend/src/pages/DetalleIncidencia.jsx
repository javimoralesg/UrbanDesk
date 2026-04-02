import { useEffect, useMemo, useState } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
import { useParams } from "react-router";
import { api } from "../services/api";
import "../assets/css/DetalleIncidencia.css";

export default function DetalleIncidencia() {
  const { id } = useParams();

  const [incidenciaApi, setIncidenciaApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const rol = "Operador"; // Operador | Tecnico | Ciudadano

  // MOCK DE RESPALDO PARA PODER VISUALIZAR LA PANTALLA
  const incidenciasMock = {
    "1": {
      id: 1,
      estado: "CREADA",
      prioridad: "SIN_ASIGNAR",
      descripcion:
        "Hay un problema en el alcantarillado que hace que se inunde la carretera.",
      fechaCreacion: "2026-03-31T07:37:20",
      ciudadano: { nombre: "Anónimo" },
      operador: null,
      ubicacion: {
        direccion: "Avenida Complutense, 30, Madrid",
        latitud: 40.444,
        longitud: -3.726,
      },
      evidencias: [
        { url: "/uploads/incidencia1_foto1.jpg" },
        { url: "/uploads/incidencia1_foto2.jpg" },
      ],
      historial: [
        {
          fechaCreacion: "2026-03-31T07:37:20",
          estadoNuevo: "CREADA",
          observaciones: "Incidencia reportada por ciudadano anónimo.",
        },
      ],
    },
    "2": {
      id: 2,
      estado: "VALIDADA",
      prioridad: "MEDIA",
      descripcion:
        "La farola de la calle principal no funciona desde hace dos días.",
      fechaCreacion: "2026-03-30T10:15:00",
      ciudadano: { nombre: "Anónimo" },
      operador: { nombre: "Operador Principal" },
      ubicacion: {
        direccion: "Calle Mayor, 12, Madrid",
        latitud: 40.4168,
        longitud: -3.7038,
      },
      evidencias: [
        { url: "/uploads/incidencia1_foto1.jpg" },
        { url: "/uploads/incidencia1_foto2.jpg" },
      ],
      historial: [
        {
          fechaCreacion: "2026-03-30T10:15:00",
          estadoNuevo: "CREADA",
          observaciones: "Incidencia reportada por ciudadano anónimo.",
        },
        {
          fechaCreacion: "2026-03-31T09:30:00",
          estadoNuevo: "VALIDADA",
          observaciones:
            "La incidencia ha sido revisada y validada por el operador.",
        },
      ],
    },
    "3": {
      id: 3,
      estado: "ASIGNADA",
      prioridad: "MEDIA",
      descripcion: "Rotura de tubería en la vía pública.",
      fechaCreacion: "2026-03-28T11:20:00",
      ciudadano: { nombre: "Anónimo" },
      operador: { nombre: "Operador Principal" },
      ubicacion: {
        direccion: "Paseo de la Castellana, 100, Madrid",
        latitud: 40.445,
        longitud: -3.691,
      },
      evidencias: [{ url: "/uploads/incidencia1_foto1.jpg" }],
      historial: [
        {
          fechaCreacion: "2026-03-28T11:20:00",
          estadoNuevo: "CREADA",
          observaciones: "Incidencia reportada por ciudadano anónimo.",
        },
        {
          fechaCreacion: "2026-03-29T09:30:00",
          estadoNuevo: "VALIDADA",
          observaciones:
            "La incidencia ha sido revisada y validada por el operador.",
        },
        {
          fechaCreacion: "2026-03-29T12:00:00",
          estadoNuevo: "ASIGNADA",
          observaciones:
            "Incidencia asignada a los operarios correspondientes.",
        },
      ],
    },
    "4": {
      id: 4,
      estado: "EN_CURSO",
      prioridad: "ALTA",
      descripcion: "Avería eléctrica en alumbrado urbano.",
      fechaCreacion: "2026-03-25T08:00:00",
      ciudadano: { nombre: "Anónimo" },
      operador: { nombre: "Operador Principal" },
      ubicacion: {
        direccion: "Avenida de América, 45, Madrid",
        latitud: 40.438,
        longitud: -3.676,
      },
      evidencias: [{ url: "/uploads/incidencia1_foto1.jpg" }],
      historial: [
        {
          fechaCreacion: "2026-03-25T08:00:00",
          estadoNuevo: "CREADA",
          observaciones: "Incidencia reportada por ciudadano anónimo.",
        },
        {
          fechaCreacion: "2026-03-26T09:30:00",
          estadoNuevo: "VALIDADA",
          observaciones:
            "La incidencia ha sido revisada y validada por el operador.",
        },
        {
          fechaCreacion: "2026-03-26T12:00:00",
          estadoNuevo: "ASIGNADA",
          observaciones:
            "Incidencia asignada a los operarios correspondientes.",
        },
        {
          fechaCreacion: "2026-03-27T08:15:00",
          estadoNuevo: "EN_CURSO",
          observaciones: "Los trabajos de intervención ya han comenzado.",
        },
      ],
    },
    "5": {
      id: 5,
      estado: "RESUELTA",
      prioridad: "ALTA",
      descripcion: "Bache peligroso en la calzada principal.",
      fechaCreacion: "2026-03-20T09:00:00",
      ciudadano: { nombre: "Anónimo" },
      operador: { nombre: "Operador Principal" },
      ubicacion: {
        direccion: "Gran Vía, 20, Madrid",
        latitud: 40.42,
        longitud: -3.705,
      },
      evidencias: [
        { url: "/uploads/incidencia1_foto1.jpg" },
        { url: "/uploads/incidencia1_foto2.jpg" },
      ],
      historial: [
        {
          fechaCreacion: "2026-03-20T09:00:00",
          estadoNuevo: "CREADA",
          observaciones: "Incidencia reportada por ciudadano anónimo.",
        },
        {
          fechaCreacion: "2026-03-21T09:30:00",
          estadoNuevo: "VALIDADA",
          observaciones:
            "La incidencia ha sido revisada y validada por el operador.",
        },
        {
          fechaCreacion: "2026-03-21T12:00:00",
          estadoNuevo: "ASIGNADA",
          observaciones:
            "Incidencia asignada a los operarios correspondientes.",
        },
        {
          fechaCreacion: "2026-03-22T08:15:00",
          estadoNuevo: "EN_CURSO",
          observaciones: "Los trabajos de intervención ya han comenzado.",
        },
        {
          fechaCreacion: "2026-03-23T16:45:00",
          estadoNuevo: "RESUELTA",
          observaciones:
            "La incidencia ha quedado resuelta correctamente.",
        },
      ],
    },
  };

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
        setError("No se pudo cargar la incidencia desde la API. Mostrando datos de ejemplo.");
        setIncidenciaApi(null);
      } finally {
        setLoading(false);
      }
    };

    cargarIncidencia();
  }, [id]);

  // FALLBACK: si no viene nada de API, usamos mock
  const incidencia = useMemo(() => {
    return incidenciaApi || incidenciasMock[id] || incidenciasMock["1"];
  }, [incidenciaApi, id]);

  const estado = incidencia?.estado || "CREADA";
  const prioridad = incidencia?.prioridad || "SIN_ASIGNAR";
  const descripcion = incidencia?.descripcion || "Sin descripción";
  const fechaCreacion = incidencia?.fechaCreacion || null;

  const ubicacion =
    incidencia?.ubicacion?.direccion || "Ubicación no disponible";
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
                  <button>Validar</button>
                  <button>Rechazar</button>
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