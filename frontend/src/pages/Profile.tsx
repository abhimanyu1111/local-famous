import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Profile() {
  const [me, setMe] = useState(null);
  const [vendorListings, setVendorListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await api.get('/users/me');
      setMe(r.data);

      // If user is a vendor, fetch their listings
      if (r.data?.role === 'vendor') {
        setLoadingListings(true);
        try {
          const L = await api.get('/listings/mine/vendor');
          setVendorListings(L.data || []);
        } finally {
          setLoadingListings(false);
        }
      }
    })();
  }, []);

  if (!me) return <div className="loading loading-spinner"></div>;

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="card bg-base-100 shadow p-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="mt-2">Name: {me.name}</div>
        <div>Email: {me.email}</div>
        <div>
          Role:{' '}
          <span className="badge badge-outline">
            {me.role}
          </span>
        </div>
      </div>

      {/* Vendor listings (only if vendor) */}
      {me.role === 'vendor' && (
        <div className="card bg-base-100 shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Listings</h2>
            <span className="badge">
              {loadingListings ? 'Loading…' : `${vendorListings.length}`}
            </span>
          </div>

          {loadingListings ? (
            <div className="flex items-center gap-2">
              <span className="loading loading-spinner" />
              <span>Fetching your listings…</span>
            </div>
          ) : vendorListings.length === 0 ? (
            <p className="opacity-70">You haven’t created any listings yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vendorListings.map((l) => {
                const cover =
                  (Array.isArray(l.images) && l.images[0]) ||
                  'https://via.placeholder.com/600x400?text=No+Image';
                return (
                  <Link
                    key={l._id}
                    to={`/listing/${l._id}`}
                    className="card bg-base-100 shadow hover:bg-base-200 transition"
                  >
                    <figure className="h-40 w-full overflow-hidden bg-base-200">
                      <img
                        src={cover}
                        alt={l.title}
                        className="h-40 w-full object-cover"
                        loading="lazy"
                      />
                    </figure>
                    <div className="card-body p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="card-title text-base">{l.title}</h3>
                        <span className="badge">{l.status}</span>
                      </div>
                      <p className="text-sm opacity-70 line-clamp-2">
                        {l.description || 'No description'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
