import MapRegister, { useMapRegisterLogic } from '../assets/components/MapRegister';

export default function RegistrarIncidencia() {
    const {
        address,
        suggestions,
        showSuggestions,
        setShowSuggestions,
        targetLocation,
        handleInputChange,
        seleccionarSugerencia,
        handleMapCenterChange,
        handleCurrentLocation
    } = useMapRegisterLogic();

    return (
        <div style={{ padding: '20px' }}>
            <h1>Registrar Incidencia</h1>
            
            <div style={{ position: 'relative', marginBottom: '20px', zIndex: 5000, maxWidth: '400px' }}>
                <input 
                    type="text" 
                    value={address} 
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onChange={handleInputChange}
                    placeholder="Escribe una dirección..."
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />

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
                                {sug.properties.name} {sug.properties.city && <small style={{color: '#666'}}>({sug.properties.city})</small>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button onClick={handleCurrentLocation} style={{ marginTop: '10px', padding: '8px 12px', cursor: 'pointer' }}>Ubicación actual</button>

            <MapRegister 
                onCenterChanged={handleMapCenterChange} 
                targetLocation={targetLocation}
            />
        </div>
    );
}
