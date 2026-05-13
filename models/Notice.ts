import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type NoticeTarget = "teacher" | "student" | "both";

export interface INotice extends Document {
  title: string;
  message: string;
  targetRole: NoticeTarget;
  createdBy: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    targetRole: {
      type: String,
      enum: ["teacher", "student", "both"],
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Notice: Model<INotice> =
  mongoose.models.Notice || mongoose.model<INotice>("Notice", NoticeSchema);

export default Notice;
