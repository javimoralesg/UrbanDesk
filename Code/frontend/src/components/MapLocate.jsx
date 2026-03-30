import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import '../assets/css/Map.css';


const pruebaPuntos = [
  { lat: 40.4531, lng: -3.6883, info: { nombre: "Estadio Santiago Bernabéu", id: 101 } },
  { lat: 40.4139, lng: -3.6921, info: { nombre: "Museo del Prado", id: 102 } },
  { lat: 40.4168, lng: -3.7038, info: { nombre: "Puerta del Sol", id: 103 } },
  { lat: 40.4155, lng: -3.7074, info: { nombre: "Plaza Mayor", id: 104 } },
  { lat: 40.4183, lng: -3.7061, info: { nombre: "Palacio Real", id: 105 } },
  { lat: 40.4192, lng: -3.7035, info: { nombre: "Catedral de la Almudena", id: 106 } },
  { lat: 40.4210, lng: -3.7058, info: { nombre: "Templo de Debod", id: 107 } },
  { lat: 40.4728, lng: -3.8723, info: { nombre: "Majadahonda", id: 108 } },
];

const COLORES_DISPONIBLES = ['blue', 'red', 'green', 'orange', 'yellow', 'violet', 'black', 'gold', 'grey'];

const crearIconoColor = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

function AutoZoom({ puntos }) {
  const map = useMap();
  useEffect(() => {
    const allLocations = [];
    puntos.forEach(p => { if (p.lat && p.lng) allLocations.push([p.lat, p.lng]); });
    
    if (allLocations.length === 0) return;
    const bounds = L.latLngBounds(allLocations);
    map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
  }, [puntos, map]);
  return null;
}

export default function MapLocate({ width = "100%", height = "500px", puntos = [] }) {
  const navigate = useNavigate();
  const location = useLocation();

  // eliminar esta línea, es solo para pruebas
  puntos = pruebaPuntos;

  return (
    <div style={{ width, height, position: 'relative', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
      
      <MapContainer 
        center={[40.41, -3.70]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <AutoZoom puntos={puntos} />

        {puntos.map((p, i) => (
          <Marker 
            key={i} 
            position={[p.lat, p.lng]} 
            icon={crearIconoColor(COLORES_DISPONIBLES[i % COLORES_DISPONIBLES.length])}
            eventHandlers={{
              click: () => {
                const currentPath = location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname;
                navigate(`${currentPath}/punto/${p.id}`);
              }
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
