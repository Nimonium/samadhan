import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  slaHours: number;
  officers: mongoose.Types.ObjectId[];
}

const DepartmentSchema: Schema<IDepartment> = new Schema({
  name: { type: String, required: true, unique: true },
  slaHours: { type: Number, required: true },
  officers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;
