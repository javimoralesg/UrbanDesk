
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function CenterController({ onCenterChanged, targetLocation }) {
  const map = useMap();
  const isProgrammaticMove = useRef(false);

  useEffect(() => {
    if (targetLocation && targetLocation.lat && targetLocation.lon) {
      isProgrammaticMove.current = true;
      if (targetLocation.boundingbox) {
         const southWest = [parseFloat(targetLocation.boundingbox[0]), parseFloat(targetLocation.boundingbox[2])];
         const northEast = [parseFloat(targetLocation.boundingbox[1]), parseFloat(targetLocation.boundingbox[3])];
         map.fitBounds([southWest, northEast], { padding: [20, 20] });
      } else {
         map.setView([targetLocation.lat, targetLocation.lon], 16);
      }
    }
  }, [targetLocation, map]);

  useMapEvents({
    moveend: () => {
      if (isProgrammaticMove.current) {
        isProgrammaticMove.current = false;
        return;
      }
      if (onCenterChanged) onCenterChanged(map.getCenter());
    }
  });

  return null;
}

export function useMapRegisterLogic() {
    const [address, setAddress] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const [targetLocation, setTargetLocation] = useState(null);
    const searchTimeoutRef = useRef(null);

    const opcionesLocalizacionActual = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10
    };

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (address.length < 3) {
                setSuggestions([]);
                return;
            }
            
            try {
                const resNom = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1&extratags=1`
                );
                const dataNom = await resNom.json();
                
                const adapted = dataNom.map(item => ({
                    geometry: { coordinates: [parseFloat(item.lon), parseFloat(item.lat)] },
                    properties: { 
                        name: item.display_name.split(', ').slice(0, 2).join(', '),
                        city: item.address.city || item.address.town || "" 
                    }
                }));
                setSuggestions(adapted);
            } catch (nomErr) {
                setSuggestions([]);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [address]);

    // Reverse Geocoding
    const fetchAddress = async (lat, lon) => {
        try {
            // Cancelamos búsqueda pendiente si el mapa se mueve
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            if (data.display_name) {
                setAddress(data.display_name);
            }
        } catch (err) { console.error("Error en Reverse Geocoding", err); }
    };

    const handleMapCenterChange = (center) => {
        const { lat, lng } = center;
        fetchAddress(lat, lng);
    };


    const seleccionarSugerencia = (sug) => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        const [lon, lat] = sug.geometry.coordinates;
        const nombre = sug.properties.name + (sug.properties.city ? `, ${sug.properties.city}` : "");
        
        setAddress(nombre);
        setSuggestions([]); 
        
        setTargetLocation({ lat, lon });
    };

    const performSearch = async (queryAddress) => {
        setSuggestions([]);
        setShowSuggestions(false);
        const query = queryAddress.trim();
        if (!query) return;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.length > 0) {
                const { lat, lon, display_name, boundingbox } = data[0];
                setAddress(display_name);

                setTargetLocation({ 
                    lat: parseFloat(lat), 
                    lon: parseFloat(lon),
                    boundingbox: boundingbox 
                });
            }
        } catch (err) { console.error(err); }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setAddress(val);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(val);
        }, 3000);
    };
    
    const handleCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                fetchAddress(latitude, longitude);
                setTargetLocation({ lat: latitude, lon: longitude });
                
            },
            (err) => { alert("No se pudo obtener la ubicación. Asegúrate de haber dado permiso."); },
            opcionesLocalizacionActual
        );  
    }

    return {
        address,
        suggestions,
        showSuggestions,
        setShowSuggestions,
        targetLocation,
        handleInputChange,
        seleccionarSugerencia,
        handleMapCenterChange,
        handleCurrentLocation
    };
}

export default function MapRegister({ width = "100%", height = "500px", onCenterChanged, targetLocation }) {
  return (
    <div style={{ width, height, position: 'relative', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
      
      <MapContainer 
        center={[40.41, -3.70]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CenterController onCenterChanged={onCenterChanged} targetLocation={targetLocation} />
      </MapContainer>

      <div style={{
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -100%)', 
          zIndex: 1000, 
          pointerEvents: 'none'
      }}>
          <img 
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" 
            style={{ width: '25px', height: '41px', display: 'block' }} 
            alt="Centro" 
          />
      </div>
    </div>
  );
}