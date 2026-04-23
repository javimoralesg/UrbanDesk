import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Link } from "react-router";

import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";

import "../assets/css/IncidenciasPublicas.css";

export default function IncidenciasPublicas() {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await api.obtenerIncidenciasPublicas();
        setIncidencias(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  return (
    <>
      <Hero />

      <main className="mis-incidencias__layout">
        <Sidebar />

        <div className="mis-incidencias__content">

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2 className="mis-incidencias__title">Incidencias públicas</h2>

            <Link
              to="/incidencias-urbanas"
              className="mis-incidencias__more-btn"
              style={{ padding: "6px 10px", fontSize: "0.8rem" }}
            >
              Volver
            </Link>
          </div>

          <p className="mis-incidencias__subtitle">
            Consulta incidencias validadas en la ciudad
          </p>

          {loading ? (
            <p>Cargando incidencias...</p>
          ) : (
            <div className="mis-incidencias__table-wrapper">
              <table className="mis-incidencias__table">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Ubicación</th>
                    <th>Estado</th>
                    <th>Prioridad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {incidencias.map((inc) => (
                    <tr key={inc.id}>
                      <td>{inc.descripcion}</td>
                      <td>{inc.ubicacion}</td>

                      <td>
                        <span
                          className={`mis-incidencias__estado-badge mis-incidencias__estado-badge--${inc.estado
                            .toLowerCase()
                            .replaceAll("_", "-")}`}
                        >
                          {inc.estado}
                        </span>
                      </td>

                      <td>{inc.prioridad}</td>

                      <td>
                        <Link
                          to={`/incidencias-urbanas/mis-incidencias/${inc.id}`}
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
          )}
        </div>
      </main>
    </>
  );
}