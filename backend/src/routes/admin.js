
import { Router } from 'express';
import { requireRole, auth } from '../middleware/auth.js';
import Vendor from '../models/Vendor.js';
import Listing from '../models/Listing.js';

const r = Router();

r.use(auth(), requireRole('admin'));

r.get('/pending/vendors', async (req, res, next) => {
  try {
    const vendors = await Vendor.find({ verified: false });
    res.json(vendors);
  } catch (e) { next(e); }
});

r.get('/pending/listings', async (req, res, next) => {
  try {
    const listings = await Listing.find({ status: 'pending' });
    res.json(listings);
  } catch (e) { next(e); }
});

export default r;
