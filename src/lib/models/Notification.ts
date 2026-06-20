import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // 'routed', 'resolved_pending_confirmation', 'sla_breach_warning', 'critical_alert'
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
