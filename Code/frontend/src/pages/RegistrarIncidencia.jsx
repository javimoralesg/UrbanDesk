import { useState, useEffect, useRef } from 'react';
import MapRegister, { useMapRegisterLogic } from '../components/MapRegister';
import { useNavigate, useParams } from 'react-router';
import Recording from '../components/Recording';
import Sidebar from '../components/Sidebar';
import Hero from "../components/Hero";
import { api } from "../services/api";
import "../assets/css/RegistrarIncidencia.css";
import Popups from '../components/Popups';
import MediaPopup from '../components/MediaPopup';

export default function RegistrarIncidencia() {

    const { id } = useParams();
    const esEdicion = !!id;    

    const [descripcion, setDescripcion] = useState('');
    const [imagenes, setImagenes] = useState([]);
    const [centerLocation, setCenterLocation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [mediaSeleccionada, setMediaSeleccionada] = useState(null);
    const [cargandoEdicion, setCargandoEdicion] = useState(true);

    const navigate = useNavigate();

    const [incidenceList, setIncidenceList] = useState([]);

    const {
        address,
        setAddress,
        setAddressSilently,
        suggestions,
        showSuggestions,
        setShowSuggestions,
        targetLocation,
        setTargetLocation,
        handleInputChange,
        seleccionarSugerencia,
        handleMapCenterChange,
        handleCurrentLocation,
        addressPopup,
        warningPopup,
        isLocationValid,
        geolocationError,
        clearGeolocationError,
    } = useMapRegisterLogic();
    

   useEffect(() => {
    if (esEdicion) {
        api.obtenerIncidenciaPorId(id).then(data => {
            setDescripcion(data.descripcion);

            if (data.ubicacion) {
                const lat = data.ubicacion.latitud;
                const lon = data.ubicacion.longitud;

                setCenterLocation({ lat, lon });

                // Establece la dirección y la ubicación en el hook SIN provocar llamadas a la API
                if (typeof setAddressSilently === 'function') {
                    setAddressSilently(data.ubicacion.direccion || '');
                } else {
                    setAddress(data.ubicacion.direccion || '');
                }

                if (typeof setTargetLocation === 'function') {
                    setTargetLocation({ lat, lon });
                }
            }
            if (data.evidencias) {
                const imagenesBackend = data.evidencias.map(ev => ({
                    id: ev.id,
                    preview: ev.url || ev.ruta,
                    existente: true  
                }));

                setImagenes(imagenesBackend);
            }

            setCargandoEdicion(false);
        });
    } else {
        setCargandoEdicion(false);
    }
}, [id]);


    useEffect(() => {
        if (geolocationError) {
            setError(geolocationError);
            clearGeolocationError();
        }
    }, [geolocationError, clearGeolocationError]);

    useEffect(() => {
        if (isSubmitting) {
            const msg = esEdicion ? 'Actualizando incidencia' : 'Registrando incidencia';
            setIncidenceList(prev => {
                if (prev.some(m => m.id === 'loading' || m.message === msg)) return prev;
                return [...prev, { id: 'loading', message: msg, type: 'waiting' }];
            });
        }

        if (!isSubmitting) {
            setIncidenceList(prev => prev.filter(m => m.id !== 'loading'));
        }

        if (!error) {
            setIncidenceList(prev => prev.filter(m => m.id !== 'error1'));
        }

        if (error) {
            setIncidenceList(prev => {
                const filtered = prev.filter(m => m.id !== 'error1' && m.message !== error);
                return [...filtered, { id: 'error1', message: error, type: 'error' }];
            });

            setTimeout(() => {
                setIncidenceList(prev => prev.filter(m => m.id !== 'error1'));
                setError(null);
            }, 5000);
        }

        if (!success) {
            setIncidenceList(prev => prev.filter(m => m.id !== 'success'));
        }

        if (success) {
            setIncidenceList(prev => {
                const filtered = prev.filter(m => m.id !== 'success' && m.message !== success);
                return [...filtered, { id: 'success', message: success, type: 'success' }];
            });

            setTimeout(() => {
                setIncidenceList(prev => prev.filter(m => m.id !== 'success'));
                setSuccess(null);
            }, 5000);
        }

        if (warningPopup) {
            setIncidenceList(prev => {
                const filtered = prev.filter(m => m.id !== 'error2' && m.message !== addressPopup);
                return [...filtered, { id: 'error2', message: addressPopup, type: 'error' }];
            });
        }

        if (!warningPopup) {
            setIncidenceList(prev => prev.filter(m => m.id !== 'error2'));
        }
    }, [isSubmitting, error, success, warningPopup, addressPopup, esEdicion]);

    const MAX_IMAGE_SIZE_MB = 10;
    const MAX_IMAGENES = 5;

    const fileToBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
            reader.readAsDataURL(file);
        });

    const crearIdImagen = (archivo) => {
        if (!archivo) return `img-${Math.random()}`;
        return `${archivo.name}-${archivo.size}-${archivo.lastModified}`;
    };

    const handleImagenesChange = (event) => {
        const archivos = Array.from(event.target.files || []);
        if (archivos.length === 0) return;

        const imagenesInvalidas = archivos.some((archivo) => !archivo.type.startsWith('image/'));
        if (imagenesInvalidas) {
            setError('Solo puedes adjuntar archivos de imagen.');
            event.target.value = '';
            return;
        }

        const imagenesGrandes = archivos.some(
            (archivo) => archivo.size > MAX_IMAGE_SIZE_MB * 1024 * 1024
        );
        if (imagenesGrandes) {
            setError(`Cada imagen debe pesar menos de ${MAX_IMAGE_SIZE_MB} MB.`);
            event.target.value = '';
            return;
        }

        setImagenes((prevImagenes) => {
            const combinadas = [...prevImagenes];

            archivos.forEach((archivo) => {
                const yaExiste = combinadas.some(
                    (img) =>
                        img.file &&
                        crearIdImagen(img.file) === crearIdImagen(archivo)
                );

                if (!yaExiste) {
                    combinadas.push({
                        id: crearIdImagen(archivo),
                        file: archivo,
                        preview: URL.createObjectURL(archivo),
                        existente: false
                    });
                }
            });

            if (combinadas.length > MAX_IMAGENES) {
                setError(`Solo puedes adjuntar un máximo de ${MAX_IMAGENES} imágenes.`);
                return combinadas.slice(0, MAX_IMAGENES);
            }

            return combinadas;
        });

        event.target.value = '';
    };

    const handleEliminarImagen = (idImagen) => {
        setImagenes((prevImagenes) => {
            const imagenAEliminar = prevImagenes.find((img) => img.id === idImagen);
            if (imagenAEliminar?.preview) {
                URL.revokeObjectURL(imagenAEliminar.preview);
            }
            return prevImagenes.filter((img) => img.id !== idImagen);
        });
    };

    const imagenesRef = useRef(imagenes);
    useEffect(() => { imagenesRef.current = imagenes; }, [imagenes]);

    useEffect(() => {
        return () => {
            imagenesRef.current.forEach((img) => {
                if (img.preview) URL.revokeObjectURL(img.preview);
            });
        };
    }, []);

    const handleRegisterIncident = async () => {
        const trimmedDescription = descripcion.trim();

        if (!trimmedDescription) {
            setError('La descripción es obligatoria.');
            return;
        }

        const latitud = targetLocation?.lat ?? centerLocation?.lat;
        const longitud = targetLocation?.lon ?? centerLocation?.lon;

        if ((!latitud || !longitud) && !esEdicion) {
            setError('Selecciona una ubicación válida en el mapa.');
            return;
        }

        if (!cargandoEdicion && isLocationValid === false) {
            setError(addressPopup || 'La ubicación introducida no es válida.');
            return;
        }

        const ubicacionOriginalValida = esEdicion && centerLocation;

        if (
            address.trim() &&
            isLocationValid === null &&
            !targetLocation &&
            !ubicacionOriginalValida
        ) {
            setError('Espera a que se valide la dirección o selecciona una sugerencia.');
            return;
        }
        
        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);

            let incidencia;

            if (esEdicion) {
                const imagenesNuevas = imagenes.filter(img => !img.existente);
                const imagenesExistentes = imagenes.filter(img => img.existente);

                const imagenesBase64 = await Promise.all(
                    imagenesNuevas.map(img => fileToBase64(img.file))
                );

                incidencia = await api.actualizarIncidencia(id, {
                    direccion: address || 'Ubicación sin dirección textual',
                    latitud,
                    longitud,
                    descripcion: trimmedDescription,
                    imagenesNuevas: imagenesBase64,
                    imagenesExistentes: imagenesExistentes.map(img => img.id)
                });
            
            } else {
                const imagenesBase64 = await Promise.all(
                    imagenes.map((imagen) => fileToBase64(imagen.file))
                );

                incidencia = await api.crearIncidencia({
                    direccion: address || 'Ubicación sin dirección textual',
                    latitud,
                    longitud,
                    descripcion: trimmedDescription,
                    imagenes: imagenesBase64,
                });
            }

            if (incidencia?.id != null) {
                setSuccess(esEdicion
                    ? 'Incidencia actualizada correctamente.'
                    : 'Incidencia registrada correctamente.'
                );
            } else {
                setError('No se pudo registrar la incidencia. Inténtalo de nuevo.');
            }

            imagenes.forEach((img) => {
                if (img.preview) URL.revokeObjectURL(img.preview);
            });

            setIsSubmitting(false);

            const user = JSON.parse(localStorage.getItem("user"));
            if (user != null) {
                navigate(`/incidencias-urbanas/mis-incidencias/${incidencia.id}`);
            }

            setDescripcion('');
            setImagenes([]);

        } catch (error) {
            console.error('Error al crear incidencia:', error);
            setIsSubmitting(false);
            setError(error?.message || 'No se pudo registrar la incidencia. Inténtalo de nuevo.');
        }
    };

    const handleCenterChanged = (center) => {
        setCenterLocation({ lat: center.lat, lon: center.lng });
        handleMapCenterChange(center);
    };

    return (
    <>
        <Popups list={incidenceList} />
        <Hero />

        <main className="registrar-incidencia__layout">
            <Sidebar />

            <section className="registrar-incidencia__content">
                {esEdicion ? (
                    <div className="detalle-incidencia__header">

            <button
              className="detalle-incidencia__back"
              onClick={() => navigate(`/incidencias-urbanas/mis-incidencias/${id}`)} >
              &lt; Volver
            </button>

            <h2 className="detalle-incidencia__title">Editar Incidencia #{id}</h2>

          </div>
                ) : (
                    <>
                        <h2 className="registrar-incidencia__title">
                            Registrar Incidencia
                        </h2>

                        <p className="registrar-incidencia__subtitle">
                            Describe la incidencia, selecciona su ubicación y adjunta imágenes si lo necesitas.
                        </p>
                    </>
                )}

                <div className="registrar-incidencia__form">
                    <Recording
                        setDescripcion={setDescripcion}
                        handleInputChange={handleInputChange}
                    />
                    <h4 className="registrar-incidencia__section-title">Descripción de la incidencia:</h4>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Descripción de la incidencia..."
                        className="registrar-incidencia__textarea"
                        rows={4}
                    />

                    <h4 className="registrar-incidencia__section-title">Ubicación:</h4>
                    <div className="registrar-incidencia__location-row">
                        <input
                            type="text"
                            value={address}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            onChange={handleInputChange}
                            placeholder="Escribe una dirección..."
                            className="registrar-incidencia__input"
                        />
                        <button
                            type="button"
                            onClick={handleCurrentLocation}
                            className="registrar-incidencia__location-btn"
                            title="Usar ubicación actual"
                        >
                        📍
                        </button>

                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="registrar-incidencia__suggestions">
                                {suggestions.map((sug, i) => (
                                    <li
                                        key={i}
                                        onClick={() => seleccionarSugerencia(sug)}
                                        className="registrar-incidencia__suggestion-item"
                                    >
                                        {sug.properties.name}{' '}
                                        {sug.properties.city && (
                                            <small>({sug.properties.city})</small>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="registrar-incidencia__map-container">
                        <MapRegister
                            onCenterChanged={handleCenterChanged}
                            targetLocation={targetLocation}
                        />
                    </div>

                    <div className="registrar-incidencia__evidences-box">
                        <p className="registrar-incidencia__evidences-title">
                            Evidencias (opcional)
                        </p>
                        <p className="registrar-incidencia__evidences-subtitle">
                            Solo imágenes. Máx. 5 archivos, 10 MB cada uno.
                        </p>

                        <div className="registrar-incidencia__file-input-wrapper">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImagenesChange}
                                className="registrar-incidencia__file-input"
                            />
                        </div>

                        {imagenes.length > 0 && (
                            <div className="registrar-incidencia__imagenes-lista">
                                {imagenes.map((imagen) => (
                                    <div
                                        key={imagen.id}
                                        className="registrar-incidencia__imagen-item"
                                    >
                                        <button
                                            type="button"
                                            className="registrar-incidencia__imagen-eliminar"
                                            onClick={() => handleEliminarImagen(imagen.id)}
                                            aria-label={`Eliminar ${imagen.file?.name || 'imagen'}`}                                            >
                                            ✕
                                        </button>

                                        <img
                                            src={imagen.preview}
                                            alt={imagen.file?.name || `Imagen ${imagen.id}`}
                                            className="registrar-incidencia__imagen-preview"
                                            onClick={() =>
                                                setMediaSeleccionada({
                                                    src: imagen.preview,
                                                    type: imagen.file?.type || 'image/*',
                                                alt: imagen.file?.name || `Imagen ${imagen.id}`,
                                                })
                                            }
                                        />
                                        {/* <p className="registrar-incidencia__imagen-nombre" title={imagen.file?.name}>
                                            {imagen.file?.name}
                                        </p> */}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleRegisterIncident}
                        disabled={isSubmitting}
                        className="registrar-incidencia__submit-btn"
                    >
                        {esEdicion ? "Guardar cambios" : "Registrar Incidencia"}
                    </button>
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