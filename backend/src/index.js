// src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import vendorRoutes from './routes/vendors.js';
import listingRoutes from './routes/listings.js';
import reviewRoutes from './routes/reviews.js';
import categoryRoutes from './routes/categories.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Allow multiple origins via CORS_ORIGIN="https://front.code.run,http://localhost:5173"
const allowed = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean) || '*';
app.use(cors({ origin: allowed }));

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) =>
  res.json({ ok: true, mongo: mongoose.connection.readyState }) // 0=disconnected, 1=connected
);

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/vendors', vendorRoutes);
app.use('/listings', listingRoutes);
app.use('/reviews', reviewRoutes);
app.use('/categories', categoryRoutes);
app.use('/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

app.listen(PORT,() => {
  console.log(`API listening on :${PORT}`);
  // Try connecting to Mongo after the server is up (so /health works even if Mongo is down)
  if (!MONGO_URI) {
    console.warn('MONGO_URI is not set — API is up but DB will be disconnected.');
    return;
  }
  const connect = () =>
    mongoose.connect(MONGO_URI, { autoIndex: false })
      .then(() => console.log('Mongo connected'))
      .catch(err => {
        console.error('Mongo connection error:', err.message);
        setTimeout(connect, 5000); // retry
      });
  connect();
});
