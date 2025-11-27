
import mongoose from 'mongoose';
const AuditSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  target: Object,
  meta: Object
}, { timestamps: { createdAt: 'ts' } });

export default mongoose.model('Audit', AuditSchema);
