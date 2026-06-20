import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'citizen' | 'officer' | 'admin' | 'cm';

export interface IUser extends Document {
  name: string;
  email?: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  department?: mongoose.Types.ObjectId;
  district?: string;
  integrityScore: number;
  createdAt: Date;
  updatedAt: Date;
  // Computed property, not stored
  activeCases?: number;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, sparse: true, unique: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['citizen', 'officer', 'admin', 'cm'],
      default: 'citizen',
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: function (this: any) {
        return this.role === 'officer' || this.role === 'admin';
      },
    },
    district: { type: String },
    integrityScore: { type: Number, default: 100 },
  },
  {
    timestamps: true,
  }
);

// We do not store activeCases, it should be derived via query.
// But we can declare it as a virtual if needed later.

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
