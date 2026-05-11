import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBranch extends Document {
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Branch: Model<IBranch> =
  mongoose.models.Branch || mongoose.model<IBranch>("Branch", BranchSchema);

export default Branch;
