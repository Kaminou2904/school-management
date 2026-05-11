import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type UserRole = "admin" | "teacher" | "student";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branch: Types.ObjectId;
  isActive: boolean;
  // teacher-specific
  subjects: string[];
  // student-specific
  class: string;
  section: string;
  rollNumber: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true,
    },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    isActive: { type: Boolean, default: true },
    // teacher
    subjects: { type: [String], default: [] },
    // student
    class: { type: String, default: "" },
    section: { type: String, default: "" },
    rollNumber: { type: String, default: "" },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
