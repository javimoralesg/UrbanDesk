import { useState, useEffect, useRef } from 'react';
import MapRegister, { useMapRegisterLogic } from '../components/MapRegister';
import Recording from '../components/Recording';
import Sidebar from '../components/Sidebar';
import Hero from "../components/Hero";
import { api } from "../services/api";
import "../assets/css/RegistrarIncidencia.css";
import Popups from '../components/Popups';
import MediaPopup from '../components/MediaPopup';

export default function RegistrarIncidencia() {
    const [descripcion, setDescripcion] = useState('');
    const [imagenes, setImagenes] = useState([]);
    const [centerLocation, setCenterLocation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [mediaSeleccionada, setMediaSeleccionada] = useState(null);

    const [incidenceList, setIncidenceList] = useState([]);

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
        isLocationValid,
        geolocationError,
        clearGeolocationError,
    } = useMapRegisterLogic();

    useEffect(() => {
        if (geolocationError) {
            setError(geolocationError);
            clearGeolocationError();
        }
    }, [geolocationError, clearGeolocationError]);

    useEffect(() => {
        if (isSubmitting) {
            const msg = 'Registrando incidencia';
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
    }, [isSubmitting, error, success, warningPopup, addressPopup]);

    const MAX_IMAGE_SIZE_MB = 5;
    const MAX_IMAGENES = 10;

    const fileToBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
            reader.readAsDataURL(file);
        });

    const crearIdImagen = (archivo) =>
        `${archivo.name}-${archivo.size}-${archivo.lastModified}`;

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
                    (img) => crearIdImagen(img.file) === crearIdImagen(archivo)
                );

                if (!yaExiste) {
                    combinadas.push({
                        id: crearIdImagen(archivo),
                        file: archivo,
                        preview: URL.createObjectURL(archivo),
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
    useEffect(() => {
        imagenesRef.current = imagenes;
    }, [imagenes]);

    useEffect(() => {
        return () => {
            imagenesRef.current.forEach((img) => {
                if (img.preview) {
                    URL.revokeObjectURL(img.preview);
                }
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

        if (!latitud || !longitud) {
            setError('Selecciona una ubicación válida en el mapa.');
            return;
        }

        if (isLocationValid === false) {
            setError(addressPopup || 'La ubicación introducida no es válida.');
            return;
        }

        if (address.trim() && isLocationValid === null && !targetLocation) {
            setError('Espera a que se valide la dirección o selecciona una sugerencia.');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);

            /* const response = await api.validateDescription(descripcion);
            const parsedResponse = JSON.parse(response);
            if (!parsedResponse.valid) {
                setError(parsedResponse.reason || 'La descripción parece no ser válida para una incidencia urbana. Por favor, revisa y corrige la descripción.');
                setIsSubmitting(false);
                return;
            } */

            const imagenesBase64 = await Promise.all(
                imagenes.map((imagen) => fileToBase64(imagen.file))
            );

            const incidenciaCreada = await api.crearIncidencia({
                direccion: address || 'Ubicación sin dirección textual',
                latitud,
                longitud,
                descripcion: trimmedDescription,
                imagenes: imagenesBase64,
            });

            if (incidenciaCreada?.id != null) {
                setSuccess('Incidencia registrada correctamente.');
            } else {
                setError('No se pudo registrar la incidencia. Inténtalo de nuevo.');
            }

            imagenes.forEach((img) => {
                if (img.preview) {
                    URL.revokeObjectURL(img.preview);
                }
            });

            setDescripcion('');
            setImagenes([]);
        } catch (error) {
            console.error('Error al crear incidencia:', error);
            setError('No se pudo registrar la incidencia. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
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
                    <h2 className="registrar-incidencia__title">
                        Registrar Incidencia
                    </h2>

                    <p className="registrar-incidencia__subtitle">
                        Describe la incidencia, selecciona su ubicación y adjunta imágenes si lo necesitas.
                    </p>

                    <div
                        className="registrar-incidencia__form-block"
                        style={{ position: 'relative', marginBottom: '20px', zIndex: 5000, maxWidth: '400px' }}
                    >
                        <Recording
                            setDescripcion={setDescripcion}
                            handleInputChange={handleInputChange}
                        />

                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Descripción de la incidencia..."
                            className="registrar-incidencia__textarea"
                            rows={6}
                        />

                        <label className="registrar-incidencia__label">
                            Adjuntar imágenes
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImagenesChange}
                            className="registrar-incidencia__file-input"
                        />

                        {imagenes.length > 0 && (
                            <p className="registrar-incidencia__file-count">
                                {imagenes.length} imagen(es) seleccionada(s)
                            </p>
                        )}

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
                                            aria-label={`Eliminar ${imagen.file.name}`}
                                        >
                                            ×
                                        </button>

                                        <img
                                            src={imagen.preview}
                                            alt={imagen.file.name}
                                            className="registrar-incidencia__imagen-preview"
                                            onClick={() =>
                                                setMediaSeleccionada({
                                                    src: imagen.preview,
                                                    type: imagen.file.type,
                                                    alt: imagen.file.name,
                                                })
                                            }
                                        />

                                        <p className="registrar-incidencia__imagen-nombre">
                                            {imagen.file.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div
                            style={{ display: 'flex', flexDirection: 'row', gap: '10px', position: 'relative' }}
                        >
                            <input
                                type="text"
                                value={address}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onChange={handleInputChange}
                                placeholder="Escribe una dirección..."
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        </div>

                        {showSuggestions && suggestions.length > 0 && (
                            <ul
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'white',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    maxHeight: '180px',
                                    overflowY: 'auto',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                    zIndex: 2000
                                }}
                            >
                                {suggestions.map((sug, i) => (
                                    <li
                                        key={i}
                                        onClick={() => seleccionarSugerencia(sug)}
                                        style={{
                                            padding: '10px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f0f0f0',
                                            fontSize: '13px',
                                            color: '#333'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f7ff'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                    >
                                        {sug.properties.name}{' '}
                                        {sug.properties.city && (
                                            <small style={{ color: '#666' }}>
                                                ({sug.properties.city})
                                            </small>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <MapRegister
                        onCenterChanged={handleCenterChanged}
                        targetLocation={targetLocation}
                    />

                    <button
                        onClick={handleCurrentLocation}
                        style={{ marginTop: '10px', padding: '8px 12px', cursor: 'pointer' }}
                    >
                        Ubicación actual
                    </button>

                    <button
                        onClick={handleRegisterIncident}
                        disabled={isSubmitting}
                        style={{
                            marginTop: '10px',
                            marginLeft: '10px',
                            padding: '8px 12px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Registrar incidencia
                    </button>
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