
import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  phone: String,
  verified: { type: Boolean, default: false },
  docs: [String]
}, { timestamps: true });

export default mongoose.model('Vendor', VendorSchema);
