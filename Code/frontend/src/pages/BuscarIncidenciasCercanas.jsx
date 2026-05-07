
import { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import { Link, useNavigate } from "react-router";
import MapRegister, { useMapRegisterLogic } from "../components/MapRegister";
import MapLocate from "../components/MapLocate";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import "../assets/css/IncidenciasUrbanas.css";
import "../assets/css/BuscarIncidenciasCercanas.css";
import "../assets/css/MisIncidencias.css";
import Popups from '../components/Popups';


export default function BuscarIncidenciasCercanas() {
  const navigate = useNavigate();
    useEffect(() => {
      const raw = localStorage.getItem('user');
      if (!raw || !JSON.parse(raw).rol || JSON.parse(raw).rol !== 'OPERADOR') {
        navigate('/incidencias-urbanas');
      }
    }, [navigate]);
  const [rangoKm, setRangoKm] = useState(1);
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vista, setVista] = useState("lista");
  const [filtroEstado, setFiltroEstado] = useState("TODAS");
  const [indicenceList, setIncidenceList] = useState([]);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const hasResultados = !loading && incidencias && incidencias.length > 0;

  const {
    address,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    targetLocation,
    handleInputChange,
    seleccionarSugerencia,
    handleMapCenterChange,
    handleCurrentLocation,
    addressPopup,
    warningPopup,
  } = useMapRegisterLogic();
    
  useEffect(() => {
    let timeout;
    if (error) {
      setIncidenceList(prev => prev.some(m => m.id === "error-msg") ? prev : [...prev, { id: "error-msg", message: error, type: "error" }]);
      timeout = setTimeout(() => {
        setIncidenceList(prev => prev.filter(m => m.id !== "error-msg"));
      }, 4000);
    } else {
      setIncidenceList(prev => prev.filter(m => m.id !== "error-msg"));
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [error]);

  useEffect(() => {
    const id = "no-results-msg";
    let timeout;
    if (busquedaRealizada && !loading && incidencias && incidencias.length === 0) {
      setIncidenceList(prev => prev.some(m => m.id === id) ? prev : [...prev, { id, message: "No se han encontrado incidencias en el área seleccionada que hayan pasado el proceso de validación.", type: "error" }]);
      timeout = setTimeout(() => {
        setIncidenceList(prev => prev.filter(m => m.id !== id));
      }, 4000);
    } else {
      setIncidenceList(prev => prev.filter(m => m.id !== id));
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [busquedaRealizada, loading, incidencias]);

  useEffect(() => {
    const msg = "Buscando incidencias cercanas";
    const id = "loading-msg";
    if (loading) {
      setIncidenceList(prev => prev.some(m => m.id === id) ? prev : [...prev, { id, message: msg, type: "waiting" }]);
    } else {
      setIncidenceList(prev => prev.filter(m => m.id !== id));
    }
  }, [loading]);

  useEffect(() => {
    const id = "address-warning";
    if (warningPopup && addressPopup) {
      setIncidenceList(prev => prev.some(m => m.id === id) ? prev : [...prev, { id, message: addressPopup, type: "error" }]);
    } else {
      setIncidenceList(prev => prev.filter(m => m.id !== id));
    }
  }, [warningPopup, addressPopup]);


  const handleRangoChange = (e) => {
    setRangoKm(e.target.value);
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setIncidencias([]);
    setBusquedaRealizada(true);
    const lat = Number(targetLocation?.lat);
    const lon = Number(targetLocation?.lng ?? targetLocation?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !rangoKm) {
      setError("Debes introducir una dirección y un rango válido");
      setLoading(false);
      return;
    }
    try {
      const res = await api.buscarIncidenciasCercanas({ latitud: lat, longitud: lon, rangoKm });
      const incidenciasConDistancia = (res || []).map((inc, idx) => {
        let ilat = null;
        let ilng = null;
        if (Number.isFinite(inc.latitud) && Number.isFinite(inc.longitud)) {
          ilat = inc.latitud;
          ilng = inc.longitud;
        } else if (inc.ubicacion) {
          if (typeof inc.ubicacion === 'object') {
            if (Number.isFinite(inc.ubicacion.latitud) && Number.isFinite(inc.ubicacion.longitud)) {
              ilat = inc.ubicacion.latitud;
              ilng = inc.ubicacion.longitud;
            } else if (Number.isFinite(inc.ubicacion.lat) && Number.isFinite(inc.ubicacion.lng)) {
              ilat = inc.ubicacion.lat;
              ilng = inc.ubicacion.lng;
            }
          } else if (typeof inc.ubicacion === 'string') {
            const match = inc.ubicacion.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
            if (match) {
              ilat = parseFloat(match[1]);
              ilng = parseFloat(match[2]);
            }
          }
        }
        let distancia = null;
        if (Number.isFinite(ilat) && Number.isFinite(ilng)) {
          distancia = calcularDistanciaKm(lat, lon, ilat, ilng);
        }
        return { ...inc, _distancia: distancia };
      });
      setIncidencias(incidenciasConDistancia);
    } catch (e) {
      setError("Error al buscar incidencias");
    } finally {
      setLoading(false);
    }
  };

  function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  let incidenciasOrdenadas = incidencias;
  incidenciasOrdenadas = [...incidencias].sort((a, b) => {
    if (a._distancia == null) return 1;
    if (b._distancia == null) return -1;
    return a._distancia - b._distancia;
  });

  const totalTodas = incidenciasOrdenadas.length;
  const totalCreadas = incidenciasOrdenadas.filter((inc) => inc.estado === "CREADA").length;
  const totalValidadas = incidenciasOrdenadas.filter((inc) => inc.estado === "VALIDADA").length;
  const totalAsignadas = incidenciasOrdenadas.filter((inc) => inc.estado === "ASIGNADA").length;
  const totalEnCurso = incidenciasOrdenadas.filter((inc) => inc.estado === "EN_CURSO").length;
  const totalResueltas = incidenciasOrdenadas.filter((inc) => inc.estado === "RESUELTA").length;
  const totalCerradas = incidenciasOrdenadas.filter((inc) => inc.estado === "CERRADA").length;
  const totalRechazadas = incidenciasOrdenadas.filter((inc) => inc.estado === "RECHAZADA").length;

  const filtrosVisibles = useMemo(() => [
    { key: "TODAS", label: "Todas", total: totalTodas },
    { key: "CREADA", label: "Creada", total: totalCreadas },
    { key: "VALIDADA", label: "Validada", total: totalValidadas },
    { key: "ASIGNADA", label: "Asignada", total: totalAsignadas },
    { key: "EN_CURSO", label: "En curso", total: totalEnCurso },
    { key: "RESUELTA", label: "Resuelta", total: totalResueltas },
    { key: "CERRADA", label: "Cerrada", total: totalCerradas },
    { key: "RECHAZADA", label: "Rechazada", total: totalRechazadas },
  ], [totalTodas, totalCreadas, totalValidadas, totalAsignadas, totalEnCurso, totalResueltas, totalCerradas, totalRechazadas]);

  const incidenciasFiltradas = useMemo(() => {
    return incidenciasOrdenadas.filter((inc) => filtroEstado === "TODAS" || inc.estado === filtroEstado);
  }, [incidenciasOrdenadas, filtroEstado]);

  return (
    <>
      <Popups list={indicenceList} />
      <Hero />
      <main className="urban-home__layout">
        <Sidebar />
        <section className="urban-home__content">
          <h2 className="urban-home__title">Buscar incidencias cercanas</h2>
          <p className="urban-home__subtitle">
            Busque las incidencias cercanas a una dirección dentro de un rango.
          </p>
          <div style={{ background: '#f3f3f3', padding: '24px', borderRadius: '10px', marginBottom: '32px' }}>
            <form className="buscar-incidencias-cercanas__form" onSubmit={handleBuscar}>
              <label style={{ flex: 2, minWidth: 0 }}>
                Dirección postal:
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={address}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onChange={handleInputChange}
                    placeholder="Escribe una dirección o selecciona en el mapa..."
                    required
                    style={{ width: '100%' }}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      background: 'white', border: '1px solid #ccc', borderRadius: '0 0 8px 8px',
                      listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 2000
                    }}>
                      {suggestions.map((sug, i) => (
                        <li
                          key={i}
                          onClick={() => seleccionarSugerencia(sug)}
                          style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '14px', color: '#333' }}
                          onMouseEnter={e => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={e => e.target.style.backgroundColor = 'white'}
                        >
                          {sug.properties.name} {sug.properties.city && <small style={{ color: '#666' }}>({sug.properties.city})</small>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </label>
              <label style={{ flex: 1, minWidth: 0 }}>
                Rango (km):
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={rangoKm}
                  onChange={handleRangoChange}
                  required
                  style={{ width: '100%' }}
                />
              </label>
              <button type="submit" disabled={loading}>
                Buscar
              </button>
            </form>
            <div className="buscar-incidencias-cercanas__map">
              <MapRegister
                onCenterChanged={handleMapCenterChange}
                targetLocation={targetLocation}
                circleRadiusKm={rangoKm}
                showCircle={true}
                incidencias={vista === 'mapa' ? incidenciasFiltradas : undefined}
                showIncidencias={vista === 'mapa'}
              />
            </div>
          </div>
          {hasResultados && (
            <>
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

              {vista === "lista" && (
                <div className="mis-incidencias__table-wrapper">
                  <table className="mis-incidencias__table">
                    <thead>
                      <tr>
                        <th style={{ width: "60px" }}>ID</th>
                        <th>Descripción</th>
                        <th style={{ width: "120px" }}>Distancia (km)</th>
                        <th style={{ width: "140px" }}>Estado</th>
                        <th style={{ width: "120px" }}>Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidenciasFiltradas.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>No hay incidencias en este estado.</td></tr>
                      )}
                      {incidenciasFiltradas.map((inc, idx) => {
                        return (
                          <tr key={inc.id}>
                            <td>{inc.id}</td>
                            <td>
                              <span style={{
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%',
                                textAlign: 'left'
                              }}
                                title={typeof inc.descripcion === 'string' ? inc.descripcion : '-'}
                              >
                                {typeof inc.descripcion === 'string' ? inc.descripcion : '-'}
                              </span>
                            </td>
                            <td>
                              {inc._distancia != null && isFinite(inc._distancia) ? inc._distancia.toFixed(2) : '-'}
                            </td>
                            <td>
                              <span className={`mis-incidencias__estado-badge mis-incidencias__estado-badge--${inc.estado?.toLowerCase().replaceAll("_", "-")}`}>
                                {inc.estado}
                              </span>
                            </td>
                            <td>
                              <Link
                                to={`/incidencias-urbanas/buscar-incidencias-cercanas/${inc.id}`}
                                className="mis-incidencias__more-btn"
                              >
                                Ver detalle
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {vista === "mapa" && (
                <div className="buscar-incidencias-cercanas__map">
                  <MapLocate
                    puntos={incidenciasFiltradas.map(inc => ({
                      lat: inc.ubicacion?.lat || inc.latitud || (typeof inc.ubicacion === 'object' && inc.ubicacion.latitud) || 0,
                      lng: inc.ubicacion?.lng || inc.longitud || (typeof inc.ubicacion === 'object' && inc.ubicacion.longitud) || 0,
                      info: { id: inc.id, nombre: (typeof inc.ubicacion === 'string' ? inc.ubicacion : (inc.ubicacion?.direccion || inc.direccion || '')) }
                    }))}
                    onMarkerClick={p => navigate(`/incidencias-urbanas/buscar-incidencias-cercanas/${p.info.id}`)}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
