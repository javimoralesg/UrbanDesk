import { useEffect, useRef, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import '../assets/css/Map.css';

import madridBoundary from '../assets/geo/madrid-boundary.json';

const MADRID_GEOMETRY = madridBoundary?.features?.[0]?.geometry ?? null;

// Creamos una máscara exterior donde el mundo es el polígono y Madrid es el agujero
const invertedMadridBoundary = (() => {
  if (!MADRID_GEOMETRY) return null;

  // Un polígono enorme que cubre todo el mapa
  const worldRing = [
    [
      [-360, -90],
      [-360, 90],
      [360, 90],
      [360, -90],
      [-360, -90],
    ],
  ];

  let invertedCoords = [...worldRing];

  if (MADRID_GEOMETRY.type === 'Polygon') {
    invertedCoords = invertedCoords.concat(MADRID_GEOMETRY.coordinates);
  } else if (MADRID_GEOMETRY.type === 'MultiPolygon') {
    MADRID_GEOMETRY.coordinates.forEach((poly) => {
      invertedCoords = invertedCoords.concat(poly);
    });
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: invertedCoords,
        },
        properties: {},
      },
    ],
  };
})();

function pointInRing(lat, lon, ringLonLat) {
  let inside = false;
  for (let i = 0, j = ringLonLat.length - 1; i < ringLonLat.length; j = i++) {
    const xi = ringLonLat[i][0];
    const yi = ringLonLat[i][1];
    const xj = ringLonLat[j][0];
    const yj = ringLonLat[j][1];

    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

function inPolygonWithHoles(lat, lon, polygonCoords) {
  if (!polygonCoords?.length) return false;
  const [outer, ...holes] = polygonCoords;
  if (!pointInRing(lat, lon, outer)) return false;
  for (const hole of holes) {
    if (pointInRing(lat, lon, hole)) return false;
  }
  return true;
}

function isInsideMadrid(lat, lon) {
  if (!MADRID_GEOMETRY) return true; // fallback
  if (MADRID_GEOMETRY.type === 'Polygon') {
    return inPolygonWithHoles(lat, lon, MADRID_GEOMETRY.coordinates);
  }
  if (MADRID_GEOMETRY.type === 'MultiPolygon') {
    return MADRID_GEOMETRY.coordinates.some((poly) =>
      inPolygonWithHoles(lat, lon, poly)
    );
  }
  return true;
}

function CenterController({ onCenterChanged, targetLocation }) {
  const map = useMap();
  const isProgrammaticMove = useRef(false);
  const lastValidCenterRef = useRef(null);

  useEffect(() => {
    lastValidCenterRef.current = map.getCenter();
  }, [map]);

  useEffect(() => {
    if (!targetLocation?.lat || !targetLocation?.lon) return;
    const lat = Number(targetLocation.lat);
    const lon = Number(targetLocation.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    if (!isInsideMadrid(lat, lon)) return;

    isProgrammaticMove.current = true;

    if (targetLocation.boundingbox) {
      const southWest = [
        parseFloat(targetLocation.boundingbox[0]),
        parseFloat(targetLocation.boundingbox[2]),
      ];
      const northEast = [
        parseFloat(targetLocation.boundingbox[1]),
        parseFloat(targetLocation.boundingbox[3]),
      ];
      map.fitBounds([southWest, northEast], { padding: [20, 20] });
      return;
    }

    map.setView([lat, lon], 16);
  }, [targetLocation, map]);

  useMapEvents({
    moveend: () => {
      const center = map.getCenter();

      if (!isInsideMadrid(center.lat, center.lng)) {
        isProgrammaticMove.current = true;
        if (lastValidCenterRef.current) {
          map.panTo(lastValidCenterRef.current, { animate: false });
        }
        return;
      }

      lastValidCenterRef.current = center;

      if (isProgrammaticMove.current) {
        isProgrammaticMove.current = false;
        return;
      }

      onCenterChanged?.(center);
    },
  });

  return null;
}

export function useMapRegisterLogic() {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [targetLocation, setTargetLocation] = useState(null);

  const [addressPopup, setAddressPopup] = useState(null);
  const [warningPopup, setWarningPopup] = useState(false);

  const searchTimeoutRef = useRef(null);
  const reverseDebounceRef = useRef(null);
  const reverseAbortRef = useRef(null);
  const reverseRequestIdRef = useRef(0);
  const lastCenterRef = useRef(null);

  const REVERSE_DEBOUNCE_MS = 1000;
  const MIN_DELTA = 0.00015;

  const opcionesLocalizacionActual = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 10,
  };

  useEffect(() => {
    if (address.trim() === '') {
      setWarningPopup(false);
      setAddressPopup(null);
    }
  }, [address]);

  const clearReverseLookup = () => {
    if (reverseDebounceRef.current) {
      clearTimeout(reverseDebounceRef.current);
      reverseDebounceRef.current = null;
    }

    if (reverseAbortRef.current) {
      reverseAbortRef.current.abort();
      reverseAbortRef.current = null;
    }
  };

  const fetchAddress = async (lat, lon, requestId) => {
    try {
      const controller = new AbortController();
      reverseAbortRef.current = controller;

      if (!isInsideMadrid(lat, lon)) {
        setAddressPopup('Ubicación fuera de los distritos de Madrid');
        setWarningPopup(true);
        return;
      }

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
        { signal: controller.signal }
      );

      if (!res.ok) {
        if (res.status === 429) {
          console.warn('Nominatim rate limit (429).');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      setWarningPopup(false);
      setAddressPopup(null);

      if (requestId !== reverseRequestIdRef.current) return;
      if (data.display_name) setAddress(data.display_name);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error en Reverse Geocoding', err);
      }
    }
  };

  const scheduleReverseLookup = (lat, lon, immediate = false) => {
    clearReverseLookup();

    const requestId = reverseRequestIdRef.current + 1;
    reverseRequestIdRef.current = requestId;

    const run = () => {
      lastCenterRef.current = { lat, lon };
      fetchAddress(lat, lon, requestId);
    };

    if (immediate) {
      run();
      return;
    }

    reverseDebounceRef.current = setTimeout(run, REVERSE_DEBOUNCE_MS);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (address.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Madrid')}&limit=5&addressdetails=1&extratags=1&countrycodes=es`
        );
        const data = await res.json();

        const filtered = data.filter(item => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          return isInsideMadrid(lat, lon);
        });

        setSuggestions(
          filtered.map((item) => ({
            geometry: {
              coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
            },
            properties: {
              name: item.display_name.split(', ').slice(0, 2).join(', '),
              city: item.address.city || item.address.town || '',
            },
          }))
        );
      } catch {
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [address]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      clearReverseLookup();
    };
  }, []);

  const handleMapCenterChange = (center) => {
    const current = { lat: center.lat, lon: center.lng };

    if (lastCenterRef.current) {
      const dLat = Math.abs(current.lat - lastCenterRef.current.lat);
      const dLon = Math.abs(current.lon - lastCenterRef.current.lon);

      if (dLat < MIN_DELTA && dLon < MIN_DELTA) return;
    }

    scheduleReverseLookup(current.lat, current.lon);
  };

  const seleccionarSugerencia = (sug) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    const [lon, lat] = sug.geometry.coordinates;
    const nombre =
      sug.properties.name +
      (sug.properties.city ? `, ${sug.properties.city}` : '');

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
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Madrid')}&countrycodes=es`
      );
      const data = await res.json();

      if (data.length > 0) {
        const { lat, lon, display_name, boundingbox } = data[0];

        if (!isInsideMadrid(lat, lon)) {            
            setAddressPopup('Ubicación fuera de los distritos de Madrid');
            setWarningPopup(true);
            return;
        }

        setWarningPopup(false);
        setAddressPopup(null);

        setAddress(display_name);
        setTargetLocation({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          boundingbox,
        });
      }
      else {
        setAddressPopup('Ubicación no encontrada, por favor intenta con otra dirección');
        setWarningPopup(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const val = e && e.target ? e.target.value : e;
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
        scheduleReverseLookup(latitude, longitude, true);
        setTargetLocation({ lat: latitude, lon: longitude });
      },
      () => {
        alert('No se pudo obtener la ubicación. Asegúrate de haber dado permiso.');
      },
      opcionesLocalizacionActual
    );
  };

  return {
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
    };
}

export default function MapRegister({
  width = '100%',
  height = '500px',
  onCenterChanged,
  targetLocation,
}) {
  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <svg style={{ height: 0, width: 0, position: 'absolute' }}>
        <defs>
          <pattern id="red-stripes" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
            <line x1="0" y="0" x2="0" y2="10" stroke="rgba(255, 0, 0, 0.4)" strokeWidth="5" />
          </pattern>
        </defs>
      </svg>

      <MapContainer center={[40.41, -3.7]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Renderiza el exterior con rayas rojas */}
        {!!invertedMadridBoundary && (
          <GeoJSON 
            data={invertedMadridBoundary} 
            style={{ 
              stroke: false, 
              fillColor: 'url(#red-stripes)', 
              fillOpacity: 1 
            }} 
          />
        )}

        {/* Renderiza el borde interior de Madrid sin relleno */}
        {!!madridBoundary?.features?.length && (
          <GeoJSON 
            data={madridBoundary} 
            style={{ 
              color: '#d33', 
              weight: 2, 
              fillOpacity: 0 
            }} 
          />
        )}
        
        <CenterController onCenterChanged={onCenterChanged} targetLocation={targetLocation} />
      </MapContainer>

      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -100%)',
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      >
        <img
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
          style={{ width: '25px', height: '41px', display: 'block' }}
          alt="Centro"
        />
      </div>
    </div>
  );
}