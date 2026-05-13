import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AssignmentType = "homework" | "assignment";

export interface IAssignment extends Document {
  title: string;
  description: string;
  type: AssignmentType;
  subject: string;
  class: string;
  section: string;
  deadline: Date;
  assignedBy: Types.ObjectId;
  branch: Types.ObjectId;
  createdAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: { type: String, enum: ["homework", "assignment"], required: true },
    subject: { type: String, required: true, trim: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    deadline: { type: Date, required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
  },
  { timestamps: true }
);

const Assignment: Model<IAssignment> =
  mongoose.models.Assignment ||
  mongoose.model<IAssignment>("Assignment", AssignmentSchema);

export default Assignment;
