import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 🧭 Fix default marker icons (for Vite / React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🔴 Custom red marker for current user location
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 🔹 Helper: re-center the map when the user's coords change
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1 });
    }
  }, [center, map]);
  return null;
}

export default function Map({ center, markers = [] }) {
  if (!center) {
    return <p className="text-center text-sm opacity-70">Fetching your location...</p>;
  }

  return (
    <MapContainer center={center} zoom={14} style={{ height: '420px', width: '100%', borderRadius: '0.5rem' }}>
      {/* Map tiles */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* 📍 Other markers */}
      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]}>
          <Popup>
            <a href={`/listing/${m.id}`} className="text-blue-500 underline">
              {m.title}
            </a>
          </Popup>
        </Marker>
      ))}

      {/* 🔴 Current user location marker */}
      <Marker position={center} icon={redIcon}>
        <Popup>You are here 📍</Popup>
      </Marker>

      <RecenterMap center={center} />
    </MapContainer>
  );
}
