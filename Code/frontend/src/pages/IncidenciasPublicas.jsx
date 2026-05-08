import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { Link, useNavigate } from "react-router";

import Hero from "../components/Hero";
import MapLocate from "../components/MapLocate";
import Sidebar from "../components/Sidebar";
import Popups from "../components/Popups";

import "../assets/css/IncidenciasPublicas.css";

const normalizarPuntoMapa = (incidencia) => {
  const latitud = incidencia?.ubicacion?.latitud ?? incidencia?.ubicacion?.lat;
  const longitud = incidencia?.ubicacion?.longitud ?? incidencia?.ubicacion?.lng ?? incidencia?.ubicacion?.lon;

  const lat = Number(latitud);
  const lng = Number(longitud);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    id: incidencia.id,
    lat,
    lng,
  };
};

export default function IncidenciasPublicas() {
  const [incidencias, setIncidencias] = useState([]);
  const [vista, setVista] = useState("lista");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [incidenceList, setIncidenceList] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    if (error) {
      setIncidenceList(prev => [...prev.filter(m => m.id !== 'error' && m.id !== 'success' && m.id !== 'loading'), { id: 'error', message: error, type: 'error' }]);
      setLoading(false);
    }
  }, [error]);
  
  useEffect(() => {
    if (loading) {
      setIncidenceList(prev => [...prev.filter(m => m.id !== 'loading'), { id: 'loading', message: 'Cargando incidencias...', type: 'waiting' }]);
    } else {
      setIncidenceList(prev => prev.filter(m => m.id !== 'loading'));
    }
  }, [loading]);

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
  
  useEffect(() => {
    if (incidencias.length === 0 && !loading) {
     setError("No se han encontrado incidencias públicas.");
    } else if (incidencias.length === 0 && loading) {
     setError("");
    }
  }, [incidencias, loading]);


  const puntosMapa = useMemo(() => {
    return incidencias
      .map(normalizarPuntoMapa)
      .filter(Boolean);
  }, [incidencias]);

  return (
    <>
      <Hero />

      <Popups list={incidenceList} />

      <main className="mis-incidencias__layout">
        <Sidebar />

        <div className="mis-incidencias__content">

            <h2 className="mis-incidencias__title">Incidencias públicas</h2>


          <p className="mis-incidencias__subtitle">
            Consulta incidencias validadas en la ciudad
          </p>

          <div className="mis-incidencias__view-buttons">
            <button
              type="button"
              className={`mis-incidencias__view-btn ${vista === "lista" ? "mis-incidencias__view-btn--active" : ""}`}
              onClick={() => setVista("lista")}
            >
              Lista
            </button>

            <button
              type="button"
              className={`mis-incidencias__view-btn ${vista === "mapa" ? "mis-incidencias__view-btn--active" : ""}`}
              onClick={() => setVista("mapa")}
            >
              Mapa
            </button>
          </div>

          {vista === "lista" ? (
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
                      <td>{inc.ubicacion?.direccion}</td>

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
                          to={`/incidencias-urbanas/incidencias-publicas/${inc.id}`}
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
          ) : puntosMapa.length > 0 ? (
            <div className="mis-incidencias__map-container">
              <MapLocate
                width="100%"
                puntos={puntosMapa}
                onMarkerClick={(punto) => navigate(`/incidencias-urbanas/incidencias-publicas/${punto.id}`)}
              />
            </div>
          ) : (
            <p>No hay incidencias públicas con coordenadas para mostrar en el mapa.</p>
          )}
        </div>
      </main>
    </>
  );
}