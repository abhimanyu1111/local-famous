import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import Map from "../components/Map";

export default function Home() {
  const [listings, setListings] = useState([]);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [radius, setRadius] = useState(5000); // in meters
  const [cats, setCats] = useState([]);

  // Get categories on mount
  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data)).catch(console.error);
  }, []);

  // Track user's live location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = [pos.coords.latitude, pos.coords.longitude];
          setCoords(newCoords);
          setLoading(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      console.warn("Geolocation not supported");
      setLoading(false);
    }
  }, []);

  // Fetch listings whenever filters or coords change
  const fetchListings = useCallback(() => {
    if (!coords) return;
    setLoading(true);
    const params = new URLSearchParams({
      lat: coords[0],
      lon: coords[1],
      radius,
      ...(category && { category }),
    });
    api
      .get(`/listings/nearby?${params.toString()}`)
      .then((r) => setListings(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [coords, category, radius]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Recenter map manually
  const handleRecenter = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error(err)
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Discover Near You</h1>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Category Filter */}
          <select
            className="select select-bordered"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {cats.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Radius Filter */}
          <div className="flex flex-col text-sm items-start">
            <label>Distance: {(radius / 1000).toFixed(1)} km</label>
            <input
              type="range"
              min="1000"
              max="20000"
              step="1000"
              value={radius}
              className="range range-xs"
              onChange={(e) => setRadius(Number(e.target.value))}
            />
          </div>

          {/* Recenter Button */}
          <button className="btn btn-outline btn-sm" onClick={handleRecenter}>
            📍 Recenter
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="card bg-base-100 shadow p-4">
        {coords ? (
          <Map
            center={coords}
            markers={listings.map((l) => ({
              lat: l.geoPoint?.coordinates?.[1],
              lng: l.geoPoint?.coordinates?.[0],
              title: l.title,
              id: l._id,
              category: l.categoryId?.name,
            }))}
          />
        ) : (
          <div className="text-center opacity-70 p-8">
            📍 Waiting for location permission...
          </div>
        )}
      </div>

      {/* Listings Section */}
      {loading ? (
        <div className="text-center opacity-70 p-4">Loading nearby listings...</div>
      ) : listings.length === 0 ? (
        <div className="text-center opacity-70 p-4">
          😕 No listings found within {(radius / 1000).toFixed(1)} km.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <a
              key={l._id}
              href={`/listing/${l._id}`}
              className="card bg-base-100 shadow hover:shadow-lg transition p-4 space-y-2"
            >
              {l.images?.[0] && (
                <img
                  src={l.images[0]}
                  alt={l.title}
                  className="rounded-lg w-full h-40 object-cover"
                />
              )}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{l.title}</h3>
                <span className="badge badge-outline">{l.categoryId?.name || "General"}</span>
              </div>
              <p className="text-sm opacity-70 line-clamp-2">{l.description}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
