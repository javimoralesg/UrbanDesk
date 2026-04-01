import { useState } from 'react';
import MapRegister, { useMapRegisterLogic } from '../components/MapRegister';
import Recording from '../components/Recording';
import Sidebar from '../components/Sidebar';
import Hero from "../components/Hero";
import { api } from "../services/api";
import "../assets/css/RegistrarIncidencia.css";

export default function RegistrarIncidencia() {
    const [descripcion, setDescripcion] = useState('');
    const [centerLocation, setCenterLocation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ error: '', success: '' });

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

    const handleRegisterIncident = async () => {
        const trimmedDescription = descripcion.trim();

        if (!trimmedDescription) {
            setFeedback({ error: 'La descripción es obligatoria.', success: '' });
            return;
        }

        const latitud = targetLocation?.lat ?? centerLocation?.lat;
        const longitud = targetLocation?.lon ?? centerLocation?.lon;

        if (!latitud || !longitud) {
            setFeedback({ error: 'Selecciona una ubicación válida en el mapa.', success: '' });
            return;
        }

        try {
            setIsSubmitting(true);
            setFeedback({ error: '', success: '' });

            const response = await api.validateDescription(descripcion);
            const parsedResponse = JSON.parse(response);
            if (parsedResponse.valid !== true || parsedResponse.valid !== "true") {
            
                setFeedback({ error:  parsedResponse.reason || 'La descripción parece no ser válida para una incidencia urbana. Por favor, revisa y corrige la descripción.' , success: '' });
                setTimeout(() => {
                    setFeedback({ error: '', success: '' });
                }, 4000);
                setIsSubmitting(false);
                return;
            }

            await api.crearIncidencia({
                direccion: address || 'Ubicación sin dirección textual',
                latitud,
                longitud,
                descripcion: trimmedDescription,
            });

            setDescripcion('');
            setFeedback({ error: '', success: 'Incidencia registrada correctamente.' });
        } catch (error) {
            console.error('Error al crear incidencia:', error);
            setFeedback({ error: 'No se pudo registrar la incidencia. Inténtalo de nuevo.', success: '' });
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
            <Hero />

            <main className="registrar-incidencia__layout">
                <Sidebar />

                <section className="registrar-incidencia__content">
                    <h2 className="registrar-incidencia__title">
                        Registrar Incidencia
                    </h2>

                    <p className="registrar-incidencia__subtitle">
                        ####Falta por cambiar
                    </p>

                    <div style={{ position: 'relative', marginBottom: '20px', zIndex: 5000, maxWidth: '400px' }}>

                        <Recording setDescripcion={setDescripcion} handleInputChange={handleInputChange} />


                        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción de la incidencia..." style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px' }} rows={6} />


                        {warningPopup && (
                            <div style={{ top: '50%', left: '10px', color: '#888' }}>
                                <h3>{addressPopup}</h3>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', position: 'relative' }}>
                            <input
                                type="text"
                                value={address}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onChange={handleInputChange}
                                placeholder="Escribe una dirección..."
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />

                            {warningPopup && (
                                <img src="/warning.png" alt="Warning" style={{ width: '20px', height: '20px' }} />
                            )}
                        </div>



                        {showSuggestions && suggestions.length > 0 && (
                            <ul style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                background: 'white', border: '1px solid #ccc', borderRadius: '4px',
                                listStyle: 'none', padding: 0, margin: 0, maxHeight: '180px', overflowY: 'auto',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)', zIndex: 2000
                            }}>
                                {suggestions.map((sug, i) => (
                                    <li
                                        key={i}
                                        onClick={() => seleccionarSugerencia(sug)}
                                        style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', fontSize: '13px', color: '#333' }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f7ff'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                    >
                                        {sug.properties.name} {sug.properties.city && <small style={{ color: '#666' }}>({sug.properties.city})</small>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button onClick={handleCurrentLocation} style={{ marginTop: '10px', padding: '8px 12px', cursor: 'pointer' }}>Ubicación actual</button>

                    <button
                        onClick={handleRegisterIncident}
                        disabled={isSubmitting}
                        style={{ marginTop: '10px', marginLeft: '10px', padding: '8px 12px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                        {isSubmitting ? 'Registrando...' : 'Registrar incidencia'}
                    </button>

                    {feedback.error && (
                        <p style={{ color: '#c62828', marginTop: '10px' }}>{feedback.error}</p>
                    )}

                    {feedback.success && (
                        <p style={{ color: '#2e7d32', marginTop: '10px' }}>{feedback.success}</p>
                    )}

                    <MapRegister
                        onCenterChanged={handleCenterChanged}
                        targetLocation={targetLocation}
                    />
                </section>

            </main>
        </>
    );
}
