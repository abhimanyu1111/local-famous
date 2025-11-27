
import mongoose from 'mongoose';

const ListingSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  title: { type: String, required: true },
  description: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  geoPoint: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], required: true } }, // [lng, lat]
  status: { type: String, enum: ['draft','pending','published','rejected'], default: 'pending' },
  ratingAvg: { type: Number, default: 0 },
  images: [String],
  hours: { open: String, close: String }
}, { timestamps: true });

ListingSchema.index({ geoPoint: '2dsphere' });

export default mongoose.model('Listing', ListingSchema);
