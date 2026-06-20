import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  complaint: mongoose.Types.ObjectId;
  action: string;
  performedBy?: mongoose.Types.ObjectId;
  fromStatus?: string;
  toStatus?: string;
  note?: string;
  timestamp: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema({
  complaint: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true },
  action: { type: String, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  fromStatus: { type: String },
  toStatus: { type: String },
  note: { type: String },
  timestamp: { type: Date, default: Date.now, required: true },
});

// Enforce append-only at schema level
AuditLogSchema.pre('updateOne', async function () {
  throw new Error('AuditLog documents cannot be updated.');
});
AuditLogSchema.pre('updateMany', async function () {
  throw new Error('AuditLog documents cannot be updated.');
});
AuditLogSchema.pre('findOneAndUpdate', async function () {
  throw new Error('AuditLog documents cannot be updated.');
});
AuditLogSchema.pre('deleteOne', async function () {
  if (process.env.NODE_ENV === 'test') return;
  throw new Error('AuditLog documents cannot be deleted.');
});
AuditLogSchema.pre('deleteMany', async function () {
  if (process.env.NODE_ENV === 'test') return;
  throw new Error('AuditLog documents cannot be deleted.');
});
AuditLogSchema.pre('findOneAndDelete', async function () {
  if (process.env.NODE_ENV === 'test') return;
  throw new Error('AuditLog documents cannot be deleted.');
});
AuditLogSchema.pre('findOneAndRemove', async function () {
  if (process.env.NODE_ENV === 'test') return;
  throw new Error('AuditLog documents cannot be deleted.');
});

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
