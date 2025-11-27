
import { Router } from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const r = Router();

r.get('/me', auth(), async (req, res, next) => {
  try {
    const me = await User.findById(req.user.id).select('-password').populate('favorites');
    res.json(me);
  } catch (e) { next(e); }
});

r.post('/favorites/:listingId', auth(), async (req, res, next) => {
  try {
    const { listingId } = req.params;
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { favorites: listingId } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

r.delete('/favorites/:listingId', auth(), async (req, res, next) => {
  try {
    const { listingId } = req.params;
    await User.findByIdAndUpdate(req.user.id, { $pull: { favorites: listingId } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default r;
