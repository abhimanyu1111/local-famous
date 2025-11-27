
import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: String
}, { timestamps: true });

ReviewSchema.index({ listingId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Review', ReviewSchema);
