import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker paths (needed for Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🧭 Helper component to recenter map dynamically
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 13, { animate: true });
    }
  }, [position, map]);
  return null;
}

// 📍 Handles clicks on the map
function LocationMarker({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function MapPicker({ position, setPosition }) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // 🔍 Handle search manually (no form submit)
  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  // 🗺️ When selecting a search result
  const handleSelect = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    setPosition([lat, lon]);
    setSearchResults([]);
    setSearch("");
  };

  // 📍 My Location button
  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Location error:", err)
    );
  };

  return (
    <div className="space-y-3">
      {/* 🔎 Search Bar (no <form>) */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch">
        <input
          type="text"
          placeholder="Search for a place..."
          className="input input-bordered flex-grow"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleSearch}
          >
            🔍
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleCurrentLocation}
          >
            📍 My Location
          </button>
        </div>
      </div>

      {/* 🧾 Search Results */}
      {searchResults.length > 0 && (
        <ul className="menu bg-base-100 rounded-box shadow max-h-48 overflow-y-auto z-10 relative">
          {searchResults.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                className="text-left"
                onClick={() => handleSelect(r)}
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 🗺️ Map */}
      <div className="rounded overflow-hidden border">
        <MapContainer
          center={position || [20.5937, 78.9629]} // Default: India
          zoom={position ? 13 : 5}
          style={{ height: "300px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {position && <Marker position={position} />}
          <LocationMarker setPosition={setPosition} />
          <RecenterMap position={position} />
        </MapContainer>
      </div>

      {/* 📍 Coordinates */}
      {position && (
        <p className="text-sm opacity-70">
          📍 Selected: Lat {position[0].toFixed(5)}, Lon {position[1].toFixed(5)}
        </p>
      )}
    </div>
  );
}
