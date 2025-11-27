
import { Router } from 'express';
import Category from '../models/Category.js';

const r = Router();

r.get('/', async (req, res, next) => {
  try {
    const cats = await Category.find().sort('name');
    res.json(cats);
  } catch (e) { next(e); }
});

export default r;
