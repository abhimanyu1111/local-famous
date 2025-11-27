import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import MapPicker from '../components/MapPicker';
import { Link } from 'react-router-dom';

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categorySlug, setCategorySlug] = useState('food');
  const [cats, setCats] = useState([]);
  const [mine, setMine] = useState([]);
  const [position, setPosition] = useState(null);
  const [images, setImages] = useState([]);

  // UX states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);

  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    api.get('/vendors/me').then(r => setVendor(r.data));
    api.get('/categories').then(r => setCats(r.data));
    api.get('/listings/mine/vendor').then(r => setMine(r.data));
  }, []);

  const becomeVendor = async () => {
    const phone = prompt('Enter phone');
    if (!phone) return;
    try {
      const res = await api.post('/vendors', { phone });
      setVendor(res.data);
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to create vendor profile');
    }
  };

  // ---- Image Upload ----
  const handleImages = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 6);
    setUploadError('');
    setFormError('');
    setFormSuccess('');
    setImages([]);
    setUploadedCount(0);

    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploaded = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // (optional) basic client validation
        if (!file.type.startsWith('image/')) {
          throw new Error(`File "${file.name}" is not an image`);
        }
        // optional size cap ~ 5MB
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds 5MB limit`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'Listings'); // must exist & be unsigned

        const res = await fetch('https://api.cloudinary.com/v1_1/dqhfa3o3e/image/upload', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const t = await res.text();
          throw new Error(`Cloudinary error (${res.status}): ${t}`);
        }

        const data = await res.json();
        if (!data?.secure_url) {
          throw new Error('Cloudinary response missing secure_url');
        }

        uploaded.push(data.secure_url);
        setUploadedCount(i + 1);
      }

      setImages(uploaded);
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ---- Validation ----
  const validate = () => {
    if (!title.trim()) return 'Title is required';
    if (!description.trim()) return 'Description is required';
    if (!categorySlug) return 'Category is required';
    if (!position) return 'Please select a location on the map';
    if (images.length === 0) return 'Please upload at least one image';
    if (uploading) return 'Please wait until images finish uploading';
    return '';
  };

  // ---- Create Listing ----
  const createListing = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const v = validate();
    if (v) {
      setFormError(v);
      return;
    }

    try {
      setCreating(true);
      const res = await api.post('/listings', {
        title,
        description,
        categorySlug,
        geoPoint: { lat: position[0], lon: position[1] },
        images
      });

      setFormSuccess('🎉 Listing created successfully!');
      // refresh "mine"
      const refresh = await api.get('/listings/mine/vendor');
      setMine(refresh.data);

      // reset form
      setTitle('');
      setDescription('');
      setCategorySlug(cats[0]?.slug || 'food');
      setPosition(null);
      setImages([]);
      setUploadedCount(0);
    } catch (err) {
      console.error(err);
      setFormError(err?.response?.data?.error || 'Failed to create listing');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
        {!vendor && (
          <button className="btn btn-primary" onClick={becomeVendor}>
            Become Vendor
          </button>
        )}
        {vendor && (
          <span className={`badge ${vendor.verified ? 'badge-success' : 'badge-warning'}`}>
            {vendor.verified ? 'Verified' : 'Pending verification'}
          </span>
        )}
      </div>

      {/* Alerts */}
      {uploading && (
        <div className="alert alert-info">
          <span>Uploading images… {uploadedCount} uploaded{uploadedCount ? '' : ''}</span>
        </div>
      )}
      {uploadError && (
        <div className="alert alert-error">
          <span>Image upload failed: {uploadError}</span>
        </div>
      )}
      {formError && (
        <div className="alert alert-warning">
          <span>{formError}</span>
        </div>
      )}
      {formSuccess && (
        <div className="alert alert-success">
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Listing form - only show if verified vendor */}
      {vendor && vendor.verified ? (
        <form
          className="card bg-base-100 shadow p-6 grid md:grid-cols-2 gap-3"
          onSubmit={createListing}
        >
          <input
            className="input input-bordered"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <select
            className="select select-bordered"
            value={categorySlug}
            onChange={e => setCategorySlug(e.target.value)}
          >
            {cats.map(c => (
              <option key={c._id} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <textarea
            className="textarea textarea-bordered md:col-span-2"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          {/* Map Picker */}
          <div className="md:col-span-2">
            <MapPicker position={position} setPosition={setPosition} />
            {position ? (
              <p className="text-xs mt-1 opacity-70">
                Selected: {position[0].toFixed(5)}, {position[1].toFixed(5)}
              </p>
            ) : (
              <p className="text-xs mt-1 opacity-70">
                Tip: Click on the map or search to set a location.
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2 space-y-2">
            <input
              type="file"
              multiple
              accept="image/*"
              className="file-input file-input-bordered w-full"
              onChange={handleImages}
              disabled={uploading || creating}
            />
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((url, i) => (
                  <img key={i} src={url} alt="preview" className="w-24 h-24 object-cover rounded" />
                ))}
              </div>
            )}
            {uploading && (
              <progress className="progress w-full" value={uploadedCount} max="6"></progress>
            )}
          </div>

          <button
            className="btn btn-secondary md:col-span-2"
            type="submit"
            disabled={uploading || creating}
            title={uploading ? 'Please wait for image upload to finish' : undefined}
          >
            {creating ? 'Creating…' : 'Create Listing'}
          </button>
        </form>
      ) : (
        vendor && (
          <p className="alert alert-warning">
            ⚠️ Your vendor profile is pending verification. You can create listings once verified.
          </p>
        )
      )}

      {/* My Listings */}
      <div className="grid md:grid-cols-2 gap-4">
        {mine.map(l => (
          <Link
            to={`/listing/${l._id}`}
            key={l._id}
            className="card bg-base-100 shadow p-4 hover:bg-base-200 transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{l.title}</h3>
              <span className="badge">{l.status}</span>
            </div>
            <p className="text-sm opacity-70 line-clamp-2">{l.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
