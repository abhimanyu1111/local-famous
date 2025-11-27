import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

// ---- helpers ---------------------------------------------------
const asId = (x) => {
  if (!x) return '';
  if (typeof x === 'string') return x;
  if (typeof x === 'object') return x._id || x.id || '';
  return '';
};

// Haversine formula for distance (in km)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userCoords, setUserCoords] = useState(null);

  // favorites
  const [isFav, setIsFav] = useState(false);

  // review compose/edit
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [editingId, setEditingId] = useState(null);

  // listing edit (owner only)
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // ---- data load ------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setError('Missing listing id.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const [lRes, rRes] = await Promise.all([
          api.get(`/listings/${id}`),
          api.get(`/reviews/for/${id}`),
        ]);

        if (cancelled) return;

        setListing(lRes?.data || null);
        setReviews(Array.isArray(rRes?.data) ? rRes.data : []);
        setError('');
      } catch (err) {
        console.error('Failed to load listing/reviews', err);
        setError('Failed to load this listing. Please refresh.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!cancelled) setUserCoords([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {}
      );
    }

    return () => { cancelled = true; };
  }, [id]);

  // ---- basic state guards --------------------------------------
  if (loading) return <div className="p-4"><span className="loading loading-spinner" /> Loading…</div>;
  if (error) return <div className="alert alert-error m-4">{error}</div>;
  if (!listing) return <div className="alert alert-warning m-4">Listing not found.</div>;

  // ---- ownership (frontend check; backend already enforces) ----
const vendorUserId =
  asId(listing?.vendorId?.userId) || // populated: listing.vendorId.userId = user _id
  asId(listing?.vendorId);
const currentUserId = asId(user?._id || user?.id);
const isListingOwner = !!currentUserId && !!asId(listing?.vendorId?.userId) && asId(listing.vendorId.userId) === currentUserId;

  // ---- numbers --------------------------------------------------
  const ratingNums = reviews.map((r) => Number(r.rating) || 0);
  const avgRating = ratingNums.length
    ? (ratingNums.reduce((a, b) => a + b, 0) / ratingNums.length).toFixed(1)
    : 'No ratings yet';

  let distance = null;
  if (userCoords && Array.isArray(listing?.geoPoint?.coordinates)) {
    const [lon, lat] = listing.geoPoint.coordinates;
    if (typeof lat === 'number' && typeof lon === 'number') {
      distance = getDistance(userCoords[0], userCoords[1], lat, lon).toFixed(2);
    }
  }

  // ---- favorite toggle -----------------------------------------
  const toggleFavorite = async () => {
    try {
      if (isFav) {
        await api.delete(`/users/favorites/${listing._id}`).catch(() => {});
        setIsFav(false);
      } else {
        await api.post(`/users/favorites/${listing._id}`);
        setIsFav(true);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update favorites');
    }
  };

  // ---- split reviews: mine vs others ---------------------------
let myReview = null;
const otherReviews = [];
const me = currentUserId;

for (const r of reviews) {
  const revUserId =
    asId(r?.userId) ||        // when not populated (string)
    asId(r?.userId?._id);     // when populated (object)

  if (me && revUserId === me) myReview = r;
  else otherReviews.push(r);
}


  // ---- review actions ------------------------------------------
  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reviews/${listing._id}`, {
        rating: Number(reviewRating),
        text: reviewText,
        reviewId: editingId || undefined,
      });
      const updated = await api.get(`/reviews/for/${id}`);
      setReviews(Array.isArray(updated?.data) ? updated.data : []);
      setReviewText('');
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      const updated = await api.get(`/reviews/for/${id}`);
      setReviews(Array.isArray(updated?.data) ? updated.data : []);
    } catch (err) {
      console.error(err);
      alert('Failed to delete review');
    }
  };

  const startEdit = (review) => {
    setReviewText(review?.text || '');
    setReviewRating(review?.rating || 5);
    setEditingId(review?._id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---- maps -----------------------------------------------------
  const openGoogleMaps = () => {
    const coords = listing?.geoPoint?.coordinates;
    if (!Array.isArray(coords)) return;
    const [lon, lat] = coords;
    if (typeof lat !== 'number' || typeof lon !== 'number') return;

    if (userCoords) {
      window.open(
        `https://www.google.com/maps/dir/${userCoords[0]},${userCoords[1]}/${lat},${lon}`,
        '_blank'
      );
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, '_blank');
    }
  };

  // ---- listing edit (with extra user-facing guard) --------------
  const onClickEditListing = () => {
    if (!isListingOwner) {
      alert('Only the vendor who created this listing can edit it.');
      return;
    }
    setEditTitle(listing?.title || '');
    setEditDescription(listing?.description || '');
    setEditMode(true);
  };

  // ---- render ---------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Listing Details */}
      <div className="card bg-base-100 shadow p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{listing?.title || 'Listing'}</h1>

          <div className="flex gap-2">
            <button
              className={`btn ${isFav ? 'btn-secondary' : 'btn-outline'}`}
              onClick={toggleFavorite}
            >
              {isFav ? '❤️ Favorited' : '♡ Favorite'}
            </button>

            {isListingOwner && (
              <button className="btn btn-secondary" onClick={onClickEditListing}>
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Carousel */}
        {Array.isArray(listing?.images) && listing.images.length > 0 ? (
          <div className="carousel w-full rounded-box">
            {listing.images.map((img, i) => (
              <div id={`slide${i}`} key={i} className="carousel-item w-full justify-center">
                <img
                  src={img}
                  alt={`Photo ${i + 1}`}
                  className="object-cover rounded-lg h-72 w-full"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500 italic">No photos to display</div>
        )}

        <p>{listing?.description || ''}</p>
        <div>⭐ {avgRating}</div>
        {distance && <div>📍 {distance} km away</div>}
        <button onClick={openGoogleMaps} className="btn btn-primary mt-2">
          Get Directions
        </button>

        {/* Owner Edit Form */}
        {isListingOwner && editMode && (
          <form
            className="mt-4 grid gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.patch(`/listings/${listing._id}`, {
                  title: editTitle,
                  description: editDescription,
                });
                const refreshed = await api.get(`/listings/${listing._id}`);
                setListing(refreshed?.data || listing);
                setEditMode(false);
              } catch (err) {
                console.error(err);
                alert('Failed to update listing');
              }
            }}
          >
            <input
              className="input input-bordered"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              required
            />
            <textarea
              className="textarea textarea-bordered"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Review Section */}
      <div className="card bg-base-100 shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Reviews</h2>

        {/* Compose / Upsert form */}
        {user ? (
          <form onSubmit={submitReview} className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                className="select select-bordered w-full sm:w-24"
                value={reviewRating}
                onChange={(e) => setReviewRating(e.target.value)}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}★</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Write a review..."
                className="input input-bordered flex-1 w-full"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />

              <button type="submit" className="btn btn-secondary w-full sm:w-auto">
                {editingId ? 'Update' : 'Submit'}
              </button>
            </div>

            {editingId && (
              <button
                type="button"
                className="btn btn-sm mt-1 w-full sm:w-auto"
                onClick={() => {
                  setEditingId(null);
                  setReviewText('');
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
        ) : (
          <p className="text-sm italic opacity-70">Please log in to write a review.</p>
        )}

        {/* Your Review (if any) */}
        {myReview && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Your Review</h3>
            <div className="border rounded p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <strong>{myReview?.userId?.name || 'You'}</strong>
                <div>{myReview?.rating}★ — {myReview?.text}</div>
              </div>
              <div className="flex gap-1 mt-2 sm:mt-0">
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => startEdit(myReview)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-xs btn-error"
                  onClick={() => deleteReview(myReview._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other Reviews */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">What others say</h3>
          {otherReviews.length === 0 ? (
            <p className="text-sm opacity-70">No other reviews yet.</p>
          ) : (
            <ul className="space-y-3">
              {otherReviews.map((r) => (
                <li
                  key={r?._id || Math.random()}
                  className="border-b pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <div>
                    <strong>{r?.userId?.name || 'Anonymous'}</strong>
                    <div>{r?.rating}★ — {r?.text}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
