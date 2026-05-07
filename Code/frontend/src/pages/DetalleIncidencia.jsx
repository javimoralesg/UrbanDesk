import { use, useEffect, useMemo, useState } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
import { useParams, useNavigate, useLocation } from "react-router";
import { api } from "../services/api";
import "../assets/css/DetalleIncidencia.css";
import Popups from '../components/Popups';
import MediaPopup from "../components/MediaPopup";

export default function DetalleIncidencia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const esMisIncidencias = location.pathname.includes("mis-incidencias");
  const esIncidenciaPublica = location.pathname.includes("incidencias-publicas");

  const [incidencia, setIncidencia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [persistentError, setPersistentError] = useState(null);
  const [working, setWorking] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mediaSeleccionada, setMediaSeleccionada] = useState(null);
  const [incidenciaAceptadaPorTecnico, setIncidenciaAceptadaPorTecnico] = useState(false);
  const [mostrarAsignacion, setMostrarAsignacion] = useState(false);
  const [especialidadesSeleccionadas, setEspecialidadesSeleccionadas] = useState([]);

  const [prioridadSeleccionada, setPrioridadSeleccionada] = useState("SIN_ASIGNAR");
  const [observaciones, setObservaciones] = useState("");
  const [formularioAbierto, setFormularioAbierto] = useState(null);
  const [comentarioTecnico, setComentarioTecnico] = useState("");
  const [tecnicoYaFinalizo, setTecnicoYaFinalizo] = useState(false);
  // "validar" | "rechazar" | null
  const [incidenceList, setIncidenceList] = useState([]);

  const especialidadesTecnico = [
    { key: "JARDINERO", label: "Jardinero" },
    { key: "FONTANERO", label: "Fontanero" },
    { key: "ELECTRICISTA", label: "Electricista" },
    { key: "PINTOR", label: "Pintor" },
    { key: "ALBAÑIL", label: "Albañil" },
  ];

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

  const id_usuario = useMemo(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;
    try {
      const user = JSON.parse(rawUser);
      return user?.id || null;
    } catch {
      return null;
    }
  }, []);


  useEffect(() => {
    const verificarSesionYRedirigir = () => {
      const rawUser = localStorage.getItem("user");
      if (!rawUser && !esIncidenciaPublica) {
        navigate("/incidencias-urbanas/login", { replace: true });
      }
    };

    const cargarIncidencia = async () => {
      try {
        setLoading(true);
        setError(null);

        let data = null;

        if (!esIncidenciaPublica) {
          data = await api.obtenerIncidenciaPorId(id);
        }
        else {
          data = await api.obtenerIncidenciaPublicaPorId(id);
        }

        if (data && Object.keys(data).length > 0) {
          setIncidencia(data);
          setPersistentError(null);
        } else {
          setIncidencia(null);
          setPersistentError("No se obtuvieron datos de la incidencia.");
        }
      } catch (err) {
        console.error("Error al cargar incidencia:", err);
        if (err?.status === 404) {
          setPersistentError("Incidencia no encontrada.");
          return;
        }

        if (err?.status === 401) {
          navigate("/incidencias-urbanas/login", { replace: true });
          return;
        }

        if (err?.status === 403) {
          setPersistentError("No tienes permiso para acceder a esta incidencia.");
          return;
        }

        setPersistentError("No se pudo cargar la incidencia.");
        setIncidencia(null);
      } finally {
        setLoading(false);
      }
    };

    verificarSesionYRedirigir();
    cargarIncidencia();
  }, [id, navigate]);

  useEffect(() => {
    setIncidenceList(prev => {
      let next = [...prev];
      if (loading) {
        if (!next.find(m => m.id === 'loading')) {
          next.push({ id: 'loading', message: 'Cargando incidencia', type: 'waiting' });
        }
      } else {
        next = next.filter(m => m.id !== 'loading');
      }

      if (working) {
        if (!next.find(m => m.id === 'working')) {
          next.push({ id: 'working', message: working, type: 'waiting' });
        } else {
          next = next.map(m => m.id === 'working' ? { ...m, message: working } : m);
        }
      } else {
        next = next.filter(m => m.id !== 'working');
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
  }, [loading, working, persistentError]);

  useEffect(() => {
    if (error) {
      setIncidenceList(prev => [...prev.filter(m => m.id !== 'error' && m.id !== 'success'), { id: 'error', message: error, type: 'error' }]);
      setSuccess(null);
      setWorking(null);
      setTimeout(() => {
        setIncidenceList(prev => prev.filter(m => m.id !== 'error'));
        setError(null);
      }, 5000);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      setIncidenceList(prev => [...prev.filter(m => m.id !== 'success' && m.id !== 'error'), { id: 'success', message: success, type: 'success' }]);
      setError(null);
      setWorking(null);
      setTimeout(() => {
        setIncidenceList(prev => prev.filter(m => m.id !== 'success'));
        setSuccess(null);
      }, 5000);
    }
  }, [success]);

  useEffect(() => {
    if (rol !== "TECNICO" || !id_usuario || !incidencia) {
      setIncidenciaAceptadaPorTecnico(false);
      return;
    }

    const historialApi = incidencia?.historiales ?? incidencia?.historial ?? [];
    const historialTecnico = Array.isArray(historialApi)
      ? historialApi
        .filter((entrada) => Number(entrada?.usuario?.id) === Number(id_usuario))
        .sort(
          (a, b) =>
            new Date(b?.fechaCambio || b?.fechaCreacion || 0) -
            new Date(a?.fechaCambio || a?.fechaCreacion || 0)
        )
      : [];

    const ultimaDecision = historialTecnico.find((entrada) => {
      const observaciones = (entrada?.observaciones || "").toLowerCase();
      return observaciones.includes("ha aceptado la incidencia");
    });

    const observacionesUltimaDecision = (ultimaDecision?.observaciones || "").toLowerCase();
    setIncidenciaAceptadaPorTecnico(observacionesUltimaDecision.includes("ha aceptado la incidencia"));
  }, [incidencia, id_usuario, rol]);

  useEffect(() => {
    const especialidadesAsignadas = [...new Set(
      (incidencia?.tecnicos || [])
        .map((tecnico) => tecnico?.especialidad)
        .filter(Boolean)
    )];
    setEspecialidadesSeleccionadas(especialidadesAsignadas);
  }, [incidencia]);

  useEffect(() => {
    if (rol !== "TECNICO" || !id_usuario || !incidencia) {
        setTecnicoYaFinalizo(false);
        return;
    }
    const yaFinalizo = (incidencia?.tecnicosFinalizadosIds || [])
        .map(Number)
        .includes(Number(id_usuario));
    setTecnicoYaFinalizo(yaFinalizo);
  }, [incidencia, id_usuario, rol]);



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
    incidencia?.operadorAsignado?.nombre;

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

  const adjuntos = (incidencia?.evidencias || []).map((ev, index) => ({
    src: ev?.url || ev?.ruta || "",
    type: ev?.tipo || ev?.mimeType || ev?.contentType || "image/*",
    alt: ev?.nombre || `Adjunto ${index + 1} de la incidencia`,
  })).filter((adjunto) => adjunto.src);

  const puntosMapa =
    typeof latitud === "number" && typeof longitud === "number"
      ? [{ id: incidencia?.id ?? Number(id), lat: latitud, lng: longitud }]
      : [];

  const historial = useMemo(() => {
    const historialApi = incidencia?.historiales ?? incidencia?.historial ?? [];
    return Array.isArray(historialApi) ? historialApi : [];
  }, [incidencia]);

  const historialOrdenado = [...historial].sort(
    (a, b) =>
      new Date(a.fechaCambio || a.fechaCreacion || 0) -
      new Date(b.fechaCambio || b.fechaCreacion || 0)
  );

  const formatearFecha = (fecha) => {
    if (!fecha) return;
    return new Date(fecha).toLocaleString("es-ES");
  };

  const validarIncidencia = async () => {
    if (prioridadSeleccionada === "SIN_ASIGNAR") {
      setError("Debes seleccionar una prioridad antes de validar.");
      return;
    }

    try {
      setWorking("Validando incidencia...");
      const data = await api.validarIncidencia(id, observaciones, prioridadSeleccionada);
      setWorking(null);
      setSuccess("Incidencia validada correctamente.");
      setIncidencia(data);
      setFormularioAbierto(null);
      setObservaciones("");
      setPrioridadSeleccionada("SIN_ASIGNAR");
    } catch (err) {
      console.error("Error al validar incidencia:", err);
      setWorking(null);
      setError("No se pudo validar la incidencia. Inténtalo de nuevo.");
    }
  };

  const rechazarIncidencia = async () => {
    if (!observaciones.trim()) {
      setError("Debes indicar una observación antes de rechazar la incidencia.");
      return;
    }

    try {
      setWorking("Rechazando incidencia...");
      const data = await api.rechazarIncidencia(id, observaciones);
      setWorking(null);
      setSuccess("Incidencia rechazada correctamente.");
      setIncidencia(data);
      setFormularioAbierto(null);
      setObservaciones("");
      setPrioridadSeleccionada("SIN_ASIGNAR");
    } catch (err) {
      console.error("Error al rechazar incidencia:", err);
      setWorking(null);
      setError("No se pudo rechazar la incidencia. Inténtalo de nuevo.");
    }
  };

  const alternarEspecialidadSeleccionada = (especialidad) => {
    setEspecialidadesSeleccionadas((prev) =>
      prev.includes(especialidad)
        ? prev.filter((item) => item !== especialidad)
        : [...prev, especialidad]
    );
  };

  const guardarAsignacionTecnicos = async () => {
    try {
      setWorking("Actualizando asignación de técnicos...");
      const data = await api.actualizarTecnicosPorEspecialidadesIncidencia(id, especialidadesSeleccionadas);
      setIncidencia(data);
      setSuccess("Asignación de técnicos actualizada correctamente.");
      setMostrarAsignacion(false);
    } catch (err) {
      console.error("Error al actualizar técnicos por especialidad:", err);
      setError(err?.message || "No se pudo actualizar la asignación de técnicos.");
    } finally {
      setWorking(null);
    }
  };

  const aceptarIncidenciaTecnico = async () => {
    if (!comentarioTecnico.trim()) {
        setError("Debes añadir un comentario para aceptar la incidencia.");
        return;
    }
    if (incidenciaAceptadaPorTecnico) {
        setError("Ya has aceptado esta incidencia.");
        return;
    }
    try {
        setWorking("Aceptando incidencia...");
        const data = await api.aceptarIncidenciaTecnico(id, id_usuario, comentarioTecnico);
        setIncidencia(data);
        setSuccess("Incidencia aceptada correctamente.");
        setIncidenciaAceptadaPorTecnico(true);
        setComentarioTecnico("");
        setFormularioAbierto(null);
    } catch (err) {
        console.error("Error al aceptar incidencia:", err);
        setError("No se pudo aceptar la incidencia. Inténtalo de nuevo.");
    } finally {
        setWorking(null);
    }
  };

  const rechazarIncidenciaTecnico = async () => {
    if (!comentarioTecnico.trim()) {
        setError("Debes añadir un comentario para rechazar la incidencia.");
        return;
    }
    try {
        setWorking("Rechazando incidencia...");
        const data = await api.rechazarIncidenciaTecnico(id, id_usuario, comentarioTecnico);
        setIncidencia(data);
        setSuccess("Incidencia rechazada correctamente.");
        setComentarioTecnico("");
        setFormularioAbierto(null);
        navigate("/incidencias-urbanas/mis-incidencias", { replace: true });
    } catch (err) {
        console.error("Error al rechazar incidencia:", err);
        setError("No se pudo rechazar la incidencia. Inténtalo de nuevo.");
    } finally {
        setWorking(null);
    }
  };

  const resolverIncidenciaTecnico = async () => {
    if (!comentarioTecnico.trim()) {
        setError("Debes añadir un comentario para resolver la incidencia.");
        return;
    }
    try {
        setWorking("Resolviendo incidencia...");
        const data = await api.resolverIncidenciaTecnico(id, id_usuario, comentarioTecnico);
        setIncidencia(data);
        setSuccess("Incidencia marcada como resuelta correctamente.");
        setComentarioTecnico("");
        setFormularioAbierto(null);
    } catch (err) {
        console.error("Error al resolver incidencia:", err);
        setError("No se pudo resolver la incidencia. Inténtalo de nuevo.");
    } finally {
        setWorking(null);
    }
  };

  const cerrarIncidenciaOperador = async () => {
    try {
        setWorking("Cerrando incidencia...");
        const data = await api.cerrarIncindencia(id, comentarioTecnico);
        setIncidencia(data);
        setSuccess("Incidencia cerrada correctamente.");
        setComentarioTecnico("");
    } catch (err) {
        console.error("Error al cerrar incidencia:", err);
        setError("No se pudo cerrar la incidencia. Inténtalo de nuevo.");
    } finally {
        setWorking(null);
    }
  };

  return (
    <>
      <Popups list={incidenceList} />
      <Hero />

      <main className="detalle-incidencia__layout">
        <Sidebar />

        <section className="detalle-incidencia__content">


          <div className="detalle-incidencia__header">

            <button
              className="detalle-incidencia__back"
              onClick={() => navigate(-1)}>
              &lt; Volver
            </button>

            <h2 className="detalle-incidencia__title">Incidencia #{id}</h2>

            <span
              className={`detalle-incidencia__estado-badge detalle-incidencia__estado-badge--${estado
                ?.toLowerCase()
                ?.replaceAll("_", "-") ?? "desconocido"}`}
            >
              {estadoLabel?.toUpperCase?.() ?? ""}
            </span>
          </div>


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

                {!esIncidenciaPublica && ( <>
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
                </>)}
              </div>
               <div className="detalle-incidencia__divider"></div>

                {esMisIncidencias && estado === "CREADA" && rol === "CIUDADANO" && (
                  <div className="detalle-incidencia__actions">
                    <button
                      className="detalle-incidencia__main-btn"
                      onClick={() => navigate(`/incidencias-urbanas/editar/${id}`)}
                    >
                      Editar incidencia
                    </button>
                  </div>
                )}

              {esMisIncidencias && estado === "CREADA" && rol === "OPERADOR" && (
                <>
                  <div className="detalle-incidencia__actions">
                    <button
                      className={`detalle-incidencia__main-btn ${formularioAbierto === "rechazar"
                        ? "detalle-incidencia__btn--light"
                        : "detalle-incidencia__btn--dark"
                        }`}
                      onClick={() =>
                        setFormularioAbierto((prev) => (prev === "validar" ? null : "validar"))
                      }
                    >
                      Validar incidencia
                    </button>

                    <button
                      className={`detalle-incidencia__main-btn ${formularioAbierto === "rechazar"
                        ? "detalle-incidencia__btn--dark"
                        : "detalle-incidencia__btn--light"
                        }`}
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
                        <label>Prioridad <span style={{ color: "red" }}>*</span></label>
                        <select
                          value={prioridadSeleccionada}
                          onChange={(e) => setPrioridadSeleccionada(e.target.value)}
                        >
                          <option value="SIN_ASIGNAR">-- Sin asignar --</option>
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
                        <button
                          onClick={validarIncidencia}
                          disabled={prioridadSeleccionada === "SIN_ASIGNAR"}
                        >
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
                        <label>Observaciones <span style={{ color: "red" }}>*</span></label>
                        <textarea
                          placeholder="Indica el motivo del rechazo..."
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                        />
                      </div>

                      <div className="detalle-incidencia__actions">
                        <button
                          onClick={rechazarIncidencia}
                          disabled={!observaciones.trim()}
                        >
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

              {esMisIncidencias && (estado === "VALIDADA" || estado === "ASIGNADA" || estado === "EN_CURSO") && rol === "OPERADOR" && (
                <>
                  { mostrarAsignacion && (<div className="detalle-incidencia__asignacion">
                    {especialidadesTecnico.map((especialidad) => {
                      const asignadosEspecialidad = (incidencia?.tecnicos || []).filter(
                        (tecnico) => tecnico?.especialidad === especialidad.key
                      );
                      const estaSeleccionado = especialidadesSeleccionadas.includes(especialidad.key);

                      return (
                        <div key={especialidad.key} className="detalle-incidencia__asignacion-row">
                          <label className="detalle-incidencia__asignacion-option">
                            <input
                              type="checkbox"
                              checked={estaSeleccionado}
                              onChange={() => alternarEspecialidadSeleccionada(especialidad.key)}
                            />
                            <span>{especialidad.label}</span>
                          </label>
                          {asignadosEspecialidad.length > 0 && (
                            <span className="detalle-incidencia__asignacion-tecnicos">
                              ({asignadosEspecialidad.map((tecnico) => tecnico?.nombre).join(", ")})
                            </span>
                          )}
                        </div>
                      );
                    })}
                    <button
                      className="detalle-incidencia__main-btn"
                      onClick={guardarAsignacionTecnicos}
                      disabled={!!working}
                    >
                      Guardar asignacion
                    </button>
                  </div>)}
                  <button className="detalle-incidencia__main-btn" onClick={() => mostrarAsignacion ? setMostrarAsignacion(false) : setMostrarAsignacion(true)}>
                      Editar Asignación
                    </button>
                </>
              )}

              {esMisIncidencias && rol === "TECNICO" && (estado === "ASIGNADA" || estado === "EN_CURSO") && (
                <>
                  <div className="detalle-incidencia__actions">
                    {!incidenciaAceptadaPorTecnico && (
                      <>
                        <button
                          className={`detalle-incidencia__main-btn ${formularioAbierto === "aceptar-tecnico"
                            ? "detalle-incidencia__btn--dark"
                            : "detalle-incidencia__btn--light"}`}
                          onClick={() => setFormularioAbierto(prev =>
                            prev === "aceptar-tecnico" ? null : "aceptar-tecnico")}
                        >
                          Aceptar incidencia
                        </button>
                        <button
                          className={`detalle-incidencia__main-btn ${formularioAbierto === "rechazar-tecnico"
                            ? "detalle-incidencia__btn--dark"
                            : "detalle-incidencia__btn--light"}`}
                          onClick={() => setFormularioAbierto(prev =>
                            prev === "rechazar-tecnico" ? null : "rechazar-tecnico")}
                        >
                          Rechazar incidencia
                        </button>
                      </>
                    )}

                    {incidenciaAceptadaPorTecnico && (
                      <button
                        className={`detalle-incidencia__main-btn ${formularioAbierto === "resolver-tecnico"
                          ? "detalle-incidencia__btn--dark"
                          : "detalle-incidencia__btn--light"}`}
                        onClick={() => setFormularioAbierto(prev =>
                          prev === "resolver-tecnico" ? null : "resolver-tecnico")}
                          disabled={tecnicoYaFinalizo}
                      >
                          {tecnicoYaFinalizo ? "Ya ha sido marcada como resuelta en esta incidencia" : "Marcar como resuelta"}
                      </button>
                    )}
                  </div>

                  {formularioAbierto === "aceptar-tecnico" && (
                    <div className="detalle-incidencia__form-card">
                      <h4 className="detalle-incidencia__form-title">Aceptar incidencia</h4>
                      <div className="detalle-incidencia__form-group">
                        <label>Comentario <span style={{ color: "red" }}>*</span></label>
                        <textarea
                          placeholder="Indica cómo vas a gestionar esta incidencia..."
                          value={comentarioTecnico}
                          onChange={(e) => setComentarioTecnico(e.target.value)}
                        />
                      </div>
                      <div className="detalle-incidencia__actions">
                        <button
                          onClick={aceptarIncidenciaTecnico}
                          disabled={!comentarioTecnico.trim()}
                        >
                          Confirmar aceptación
                        </button>
                        <button
                          type="button"
                          onClick={() => { setFormularioAbierto(null); setComentarioTecnico(""); }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {formularioAbierto === "rechazar-tecnico" && (
                    <div className="detalle-incidencia__form-card">
                      <h4 className="detalle-incidencia__form-title">Rechazar incidencia</h4>
                      <div className="detalle-incidencia__form-group">
                        <label>Motivo del rechazo <span style={{ color: "red" }}>*</span></label>
                        <textarea
                          placeholder="Indica el motivo por el que rechazas esta incidencia..."
                          value={comentarioTecnico}
                          onChange={(e) => setComentarioTecnico(e.target.value)}
                        />
                      </div>
                      <div className="detalle-incidencia__actions">
                        <button
                          onClick={rechazarIncidenciaTecnico}
                          disabled={!comentarioTecnico.trim()}
                        >
                          Confirmar rechazo
                        </button>
                        <button
                          type="button"
                          onClick={() => { setFormularioAbierto(null); setComentarioTecnico(""); }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {formularioAbierto === "resolver-tecnico" && (
                    <div className="detalle-incidencia__form-card">
                      <h4 className="detalle-incidencia__form-title">Marcar como resuelta</h4>
                      <div className="detalle-incidencia__form-group">
                        <label>Comentario de resolución <span style={{ color: "red" }}>*</span></label>
                        <textarea
                          placeholder="Describe cómo se ha resuelto la incidencia..."
                          value={comentarioTecnico}
                          onChange={(e) => setComentarioTecnico(e.target.value)}
                        />
                      </div>
                      <div className="detalle-incidencia__actions">
                        <button
                          onClick={resolverIncidenciaTecnico}
                          disabled={!comentarioTecnico.trim()}
                        >
                          Confirmar resolución
                        </button>
                        <button
                          type="button"
                          onClick={() => { setFormularioAbierto(null); setComentarioTecnico(""); }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {esMisIncidencias && estado === "RESUELTA" && rol === "OPERADOR" && (
                <div className="detalle-incidencia__form-group">
                        <label>Comentario de resolución <span style={{ color: "red" }}>*</span></label>
                        <textarea
                          placeholder="Describe cómo se ha resuelto la incidencia..."
                          value={comentarioTecnico}
                          onChange={(e) => setComentarioTecnico(e.target.value)}
                        />
                     
                <button onClick={cerrarIncidenciaOperador} className="detalle-incidencia__main-btn">
                  Cerrar incidencia
                </button>
                 </div>
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
          
          {!esIncidenciaPublica && (
          <div className="detalle-incidencia__section">
            <h3>Adjuntos</h3>

            <div className="detalle-incidencia__attachments">
              {adjuntos.length > 0 ? (
                adjuntos.map((adjunto, index) => (
                  <div
                    key={index}
                    className="detalle-incidencia__adjunto-item"
                    onClick={() => setMediaSeleccionada(adjunto)}
                    style={{ cursor: "pointer" }}
                  >
                    {adjunto.type?.startsWith("video/") ? (
                      <video className="detalle-incidencia__attachment-image">
                        <source src={adjunto.src} type={adjunto.type} />
                      </video>
                    ) : (
                      <img
                        src={adjunto.src}
                        alt={adjunto.alt}
                        className="detalle-incidencia__attachment-image"
                      />
                    )}
                  </div>
                ))
              ) : (
                <p>No hay adjuntos disponibles.</p>
              )}
            </div>
          </div>)}

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

      <MediaPopup
        isOpen={!!mediaSeleccionada}
        media={mediaSeleccionada}
        onClose={() => setMediaSeleccionada(null)}
      />
    </>
  );
}