import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComplaint extends Document {
  complaintId: string;
  title: string;
  description: string;
  category: 'roads' | 'water' | 'electricity' | 'sanitation' | 'law_order' | 'other';
  categorySource: 'ai_suggested' | 'manual';
  department: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'routed' | 'in_progress' | 'resolved_pending_confirmation' | 'closed' | 'reopened';
  citizen: mongoose.Types.ObjectId;
  officer?: mongoose.Types.ObjectId;
  district: string;
  geo?: { lat: number; lng: number };
  evidenceUrls: string[];
  resolutionNote?: string;
  resolutionEvidenceUrls: string[];
  source: 'direct' | 'mcd311';
  mcd311Ref?: string;
  citizenConfirmedAt?: Date;
  autoClosedAt?: Date;
  slaDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

const ComplaintSchema: Schema<IComplaint> = new Schema(
  {
    complaintId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['roads', 'water', 'electricity', 'sanitation', 'law_order', 'other'],
      required: true,
    },
    categorySource: {
      type: String,
      enum: ['ai_suggested', 'manual'],
      required: true,
    },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    status: {
      type: String,
      enum: [
        'submitted',
        'routed',
        'in_progress',
        'resolved_pending_confirmation',
        'closed',
        'reopened',
      ],
      default: 'submitted',
      required: true,
    },
    citizen: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    officer: { type: Schema.Types.ObjectId, ref: 'User' },
    district: { type: String, required: true },
    geo: {
      lat: { type: Number },
      lng: { type: Number },
    },
    evidenceUrls: [{ type: String }],
    resolutionNote: { type: String },
    resolutionEvidenceUrls: [{ type: String }],
    source: {
      type: String,
      enum: ['direct', 'mcd311'],
      default: 'direct',
      required: true,
    },
    mcd311Ref: { type: String },
    citizenConfirmedAt: { type: Date },
    autoClosedAt: { type: Date },
    slaDeadline: { type: Date, required: true },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Optional: Pre-save hook to generate complaintId if we wanted to do it here,
// but usually it's better done in the service layer or seed script to ensure sequence correctness.

const Complaint: Model<IComplaint> =
  mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);

export default Complaint;
