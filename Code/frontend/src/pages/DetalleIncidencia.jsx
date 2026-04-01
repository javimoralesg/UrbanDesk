import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
import { useParams } from "react-router";
import { api } from "../services/api";
import "../assets/css/DetalleIncidencia.css";

export default function DetalleIncidencia() {

  const { id } = useParams(); 
  const [incidencia, setIncidencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const rol = "Operador"; 

  useEffect(() => {
    const cargarIncidencia = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await api.obtenerIncidenciaPorId(id);
        setIncidencia(data);
      } catch (err) {
        console.error("Error al cargar incidencia:", err);
        setError("No se pudo cargar la incidencia.");
      } finally {
        setLoading(false);
      }
    };

    cargarIncidencia();
  }, [id]);

  const estado = incidencia?.estado || "CREADA";
  const prioridad = incidencia?.prioridad || "SIN_ASIGNAR";
  const descripcion = incidencia?.descripcion || "Sin descripción";
  const ubicacion = incidencia?.ubicacion?.direccion || "Ubicación no disponible";
  const latitud = incidencia?.ubicacion?.latitud;
  const longitud = incidencia?.ubicacion?.longitud;

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

  if (loading) {
    return (
      <>
        <Hero />
        <main className="detalle-incidencia__layout">
          <Sidebar />
          <section className="detalle-incidencia__content">
            <h2>Incidencia {id}</h2>
            <p>Cargando incidencia...</p>
          </section>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Hero />
        <main className="detalle-incidencia__layout">
          <Sidebar />
          <section className="detalle-incidencia__content">
            <h2>Incidencia {id}</h2>
            <p>{error}</p>
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

          <h2>Incidencia {id}</h2>

          <p className="detalle-incidencia__subtitle">
            Consulta toda la información relacionada con incidencias urbanas
          </p>

          <button
            className="detalle-incidencia__back"
            onClick={() => window.history.back()}
          >
            &lt; volver
          </button>

          <div className="detalle-incidencia__info">
            <p>
                <strong>Estado:</strong>
                <span
                    className={`detalle-incidencia__estado-badge detalle-incidencia__estado-badge--${estado
                    .toLowerCase()
                    .replaceAll("_", "-")}`}
                >
                    {estadoLabel}
                </span>
            </p>
            {estado !== "CREADA" && (
              <p>
                <strong>Prioridad:</strong> {prioridadLabel}
              </p>
            )}

            <p>
              <strong>Ubicación:</strong> {ubicacion}
            </p>
          </div>

          <div className="detalle-incidencia__map">
            <MapLocate width="100%" puntos={puntosMapa} />
          </div>

          <div className="detalle-incidencia__section">
            <h3>Descripción:</h3>
            <p className="detalle-incidencia__text">
              {descripcion}
            </p>
          </div>

          {/* HISTORIAL */}
          <div className="detalle-incidencia__section">
            <h3>Historial:</h3>

            <div className="detalle-incidencia__history">
              <div>• 01-01-2024 — Creada</div>

              {(estado === "VALIDADA" || estado === "ASIGNADA" || estado === "EN_CURSO" || estado === "RESUELTA") && (
                <div>• 03-01-2024 — Validada</div>
              )}

              {(estado === "ASIGNADA" || estado === "EN_CURSO" || estado === "RESUELTA") && (
                <div>• 03-01-2024 — Asignada</div>
              )}

              {(estado === "EN_CURSO" || estado === "RESUELTA") && (
                <div>• 03-01-2024 — En curso</div>
              )}

              {estado === "RESUELTA" && (
                <>
                  <div>✔ Jardinero — 13-01-2024</div>
                  <div>✔ Fontanero — 11-01-2024</div>
                  <div>✔ Electricista — 09-01-2024</div>
                  <div>• 08-01-2024 — Resuelta</div>
                </>
              )}
            </div>
          </div>

          {/* ADJUNTOS */}
          {adjuntos.length > 0 && (
            <div className="detalle-incidencia__attachments">
              {adjuntos.map((adjunto, index) => (
                <img
                  key={index}
                  src={adjunto}
                  alt={`Adjunto ${index + 1} de la incidencia`}
                  className="detalle-incidencia__attachment-image"
                />
              ))}
            </div>
          )}

          {/* ACCIONES */}

          {estado === "CREADA" && rol === "Operador" && (
            <div className="detalle-incidencia__actions">
              <button>Validar</button>
              <button>Rechazar</button>
            </div>
          )}

          {estado === "VALIDADA" && rol === "Operador" && (
            <>
              <div className="detalle-incidencia__asignacion">
                <div>Jardinero <button className="delete">Eliminar</button></div>
                <div>Fontanero <button className="delete">Eliminar</button></div>
                <div>Electricista <button className="delete">Eliminar</button></div>
                <div>Pintor <button className="add">Añadir</button></div>
                <div>Albañil <button className="add">Añadir</button></div>
              </div>

              <button className="detalle-incidencia__main-btn">
                Asignar
              </button>
            </>
          )}

          {(estado === "ASIGNADA" || estado === "EN_CURSO") && (
            <button className="detalle-incidencia__main-btn">
              Editar asignación
            </button>
          )}

          {estado === "RESUELTA" && rol === "Operador" && (
            <button className="detalle-incidencia__main-btn">
              Cerrar incidencia
            </button>
          )}

        </section>
      </main>
    </>
  );
}