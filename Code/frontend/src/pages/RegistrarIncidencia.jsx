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

    const navigate = useNavigate();

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

    // 🔥 Cargar datos en edición
    useEffect(() => {
        if (esEdicion) {
            api.obtenerIncidenciaPorId(id).then(data => {
                setDescripcion(data.descripcion);

                if (data.ubicacion) {
                    handleInputChange({ target: { value: data.ubicacion.direccion } });

                    setCenterLocation({
                        lat: data.ubicacion.latitud,
                        lon: data.ubicacion.longitud
                    });
                }
            });
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
                if (prev.some(m => m.id === 'loading')) return prev;
                return [...prev, { id: 'loading', message: msg, type: 'waiting' }];
            });
        }

        if (!isSubmitting) {
            setIncidenceList(prev => prev.filter(m => m.id !== 'loading'));
        }

    }, [isSubmitting, esEdicion]);

    const fileToBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject();
            reader.readAsDataURL(file);
        });

    const handleImagenesChange = (event) => {
        const archivos = Array.from(event.target.files || []);

        setImagenes(prev => [
            ...prev,
            ...archivos.map(file => ({
                id: file.name,
                file,
                preview: URL.createObjectURL(file)
            }))
        ]);
    };

    const handleEliminarImagen = (idImagen) => {
        setImagenes(prev => prev.filter(img => img.id !== idImagen));
    };

    const handleRegisterIncident = async () => {

        const latitud = targetLocation?.lat ?? centerLocation?.lat;
        const longitud = targetLocation?.lon ?? centerLocation?.lon;

        try {
            setIsSubmitting(true);

            let incidencia;

            if (esEdicion) {
                incidencia = await api.actualizarIncidencia(id, {
                    direccion: address,
                    latitud,
                    longitud,
                    descripcion
                });
            } else {
                const imagenesBase64 = await Promise.all(
                    imagenes.map(img => fileToBase64(img.file))
                );

                incidencia = await api.crearIncidencia({
                    direccion: address,
                    latitud,
                    longitud,
                    descripcion,
                    imagenes: imagenesBase64
                });
            }

            navigate(`/incidencias-urbanas/mis-incidencias/${incidencia.id}`);

        } catch (e) {
            console.error(e);
        }

        setIsSubmitting(false);
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
                        {esEdicion ? "Editar Incidencia" : "Registrar Incidencia"}
                    </h2>

                    <p className="registrar-incidencia__subtitle">
                        Describe la incidencia, selecciona su ubicación y adjunta imágenes.
                    </p>

                    <div className="registrar-incidencia__form">

                        <Recording setDescripcion={setDescripcion} />

                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="registrar-incidencia__textarea"
                        />

                        <div className="registrar-incidencia__location-row">
                            <input
                                value={address}
                                onChange={handleInputChange}
                                className="registrar-incidencia__input"
                            />

                            <button onClick={handleCurrentLocation}>
                                📍
                            </button>
                        </div>

                        <MapRegister
                            onCenterChanged={handleCenterChanged}
                            targetLocation={targetLocation}
                        />

                        <input type="file" multiple onChange={handleImagenesChange} />

                        <div className="registrar-incidencia__imagenes-lista">
                            {imagenes.map(img => (
                                <div key={img.id}>
                                    <img src={img.preview} width="100" />
                                    <button onClick={() => handleEliminarImagen(img.id)}>X</button>
                                </div>
                            ))}
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