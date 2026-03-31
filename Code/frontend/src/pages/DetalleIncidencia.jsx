import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
// import "../assets/css/DetalleIncidencia.css";
import { useParams } from "react-router";

export default function DetalleIncidencia() {

  const rol = "Operador"; // Operador | Tecnico | Ciudadano
  const estado = "Validada"; // Creada | Validada | Asignada | "En curso" | Resuelta

  return (
    <>
      <Hero />
      <main className="detalle-incidencia__layout">
        <Sidebar />

        <section className="detalle-incidencia__content">

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
                <strong>Prioridad:</strong>{" "}
                {estado === "Resuelta" ? "Alta" : "Media"}
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


          {/* 1️⃣ CREADA → operador valida */}
          {estado === "Creada" && rol === "Operador" && (
            <div className="detalle-incidencia__actions">
              <button>Validar</button>
              <button>Rechazar</button>
            </div>
          )}

          {/* 2️⃣ VALIDADA → asignación */}
          {estado === "Validada" && rol === "Operador" && (
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

          {/*  ASIGNADA */}
          {estado === "Asignada" && (
            <button className="detalle-incidencia__main-btn">
              Editar asignación
            </button>
          )}

          {/* EN CURSO */}
          {estado === "En curso" && (
            <button className="detalle-incidencia__main-btn">
              Editar asignación
            </button>
          )}

          {/* RESUELTA */}
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