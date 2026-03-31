import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
import { useParams } from "react-router";
// import "../assets/css/DetalleIncidencia.css";

export default function DetalleIncidencia() {

  const { id } = useParams(); // 🔥 clave

  const rol = "Operador"; // Operador | Tecnico | Ciudadano

  const incidenciasMock = {
    "1": { estado: "Creada", prioridad: "Alta" },
    "2": { estado: "Validada", prioridad: "Media" },
    "3": { estado: "Asignada", prioridad: "Media" },
    "4": { estado: "En curso", prioridad: "Alta" },
    "5": { estado: "Resuelta", prioridad: "Alta" },
  };

  const incidencia = incidenciasMock[id] || {
    estado: "Creada",
    prioridad: "Media",
  };

  const { estado, prioridad } = incidencia;

  return (
    <>
      <Hero />
      <main className="detalle-incidencia__layout">
        <Sidebar />

        <section className="detalle-incidencia__content">

          {/* 👇 añadido para ver qué incidencia es */}
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
            <p><strong>Estado:</strong> {estado}</p>

            {estado !== "Creada" && (
              <p>
                <strong>Prioridad:</strong> {prioridad}
              </p>
            )}

            <p>
              <strong>Ubicación:</strong> Avenida Complutense, 30, Madrid
            </p>
          </div>

          <div className="detalle-incidencia__map">
            <MapLocate width="100%" />
          </div>

          <div className="detalle-incidencia__section">
            <h3>Descripción:</h3>
            <p className="detalle-incidencia__text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit...
            </p>
          </div>

          {/* HISTORIAL */}
          <div className="detalle-incidencia__section">
            <h3>Historial:</h3>

            <div className="detalle-incidencia__history">
              <div>• 01-01-2024 — Creada</div>

              {(estado === "Validada" || estado === "Asignada" || estado === "En curso" || estado === "Resuelta") && (
                <div>• 03-01-2024 — Validada</div>
              )}

              {(estado === "Asignada" || estado === "En curso" || estado === "Resuelta") && (
                <div>• 03-01-2024 — Asignada</div>
              )}

              {(estado === "En curso" || estado === "Resuelta") && (
                <div>• 03-01-2024 — En curso</div>
              )}

              {estado === "Resuelta" && (
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
          <div className="detalle-incidencia__section">
            <h3>Archivos adjuntos:</h3>

            <div className="detalle-incidencia__attachments">
              <div className="box"></div>
              <div className="box"></div>
            </div>
          </div>

          {/* ACCIONES */}

          {estado === "Creada" && rol === "Operador" && (
            <div className="detalle-incidencia__actions">
              <button>Validar</button>
              <button>Rechazar</button>
            </div>
          )}

          {estado === "Validada" && rol === "Operador" && (
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

          {(estado === "Asignada" || estado === "En curso") && (
            <button className="detalle-incidencia__main-btn">
              Editar asignación
            </button>
          )}

          {estado === "Resuelta" && rol === "Operador" && (
            <button className="detalle-incidencia__main-btn">
              Cerrar incidencia
            </button>
          )}

        </section>
      </main>
    </>
  );
}