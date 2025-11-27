import { Router } from 'express';
import Listing from '../models/Listing.js';
import Vendor from '../models/Vendor.js';
import Category from '../models/Category.js';
import { auth, requireRole } from '../middleware/auth.js';

const r = Router();

// -----------------------------
// Create a new listing
// -----------------------------
r.post('/', auth(), async (req, res, next) => {
  try {
    const { title, description, categorySlug, geoPoint, images, hours } = req.body;

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(400).json({ error: 'Vendor profile required' });

    const category = await Category.findOne({ slug: categorySlug });
    if (!category) return res.status(400).json({ error: 'Invalid category' });

    // ✅ Auto-publish if vendor is verified
    const status = vendor.verified ? 'published' : 'pending';

    const listing = await Listing.create({
      vendorId: vendor._id,
      title,
      description,
      categoryId: category._id,
      geoPoint: { type: 'Point', coordinates: [geoPoint.lon, geoPoint.lat] }, // [lon, lat]
      status,
      images,
      hours,
    });

    res.status(201).json(listing);
  } catch (e) {
    next(e);
  }
});

// -----------------------------
// Get nearby listings (published only)
// -----------------------------
r.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lon, radius = 5000, limit = 50, category } = req.query;
    const q = { status: 'published' };

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) q.categoryId = cat._id;
    }

    const docs = await Listing.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [Number(lon), Number(lat)] },
          distanceField: 'distance',
          maxDistance: Number(radius),
          spherical: true,
        },
      },
      { $match: q },
      { $limit: Number(limit) },
    ]);

    res.json(docs);
  } catch (e) {
    next(e);
  }
});

// -----------------------------
// Get listings for current vendor
// -----------------------------
r.get('/mine/vendor', auth(), async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.json([]);
    const items = await Listing.find({ vendorId: vendor._id });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

// -----------------------------
// Admin: update listing status (keep if you still want admin to moderate status)
// -----------------------------
r.patch('/:id/status', auth(), requireRole('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const item = await Listing.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

// -----------------------------
// Update listing — ONLY the OWNER can update (no admin override)
// -----------------------------
r.patch('/:id', auth(), async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id)
      .populate({ path: 'vendorId', select: 'userId' });
    if (!listing) return res.status(404).json({ error: 'Not found' });

    const isOwner = String(listing.vendorId.userId) === req.user.id;
    if (!isOwner) {
      // ❌ No admin bypass here — owner only
      return res.status(403).json({ error: 'Forbidden: only the listing owner can update this listing' });
    }

    const update = {};
    const fields = ['title', 'description', 'geoPoint', 'images', 'hours'];
    for (const f of fields) {
      if (f in req.body) update[f] = req.body[f];
    }

    // categorySlug -> categoryId (optional)
    if (req.body.categorySlug) {
      const cat = await Category.findOne({ slug: req.body.categorySlug });
      if (!cat) return res.status(400).json({ error: 'Invalid category' });
      update.categoryId = cat._id;
    }

    // ensure geoPoint normalization if provided
    if (update.geoPoint?.lat != null && update.geoPoint?.lon != null) {
      update.geoPoint = {
        type: 'Point',
        coordinates: [update.geoPoint.lon, update.geoPoint.lat],
      };
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(listing);
  } catch (e) {
    next(e);
  }
});

// -----------------------------
// Get listing by ID
// -----------------------------
r.get('/:id', async (req, res, next) => {
  try {
    const item = await Listing.findById(req.params.id)
      .populate({ path: 'vendorId', select: 'userId' }); // exposes vendorId.userId for owner checks
    res.json(item);
  } catch (e) {
    next(e);
  }
});

export default r;
