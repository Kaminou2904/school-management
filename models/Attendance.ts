import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AttendanceStatus = "present" | "absent" | "late";

export interface IAttendance extends Document {
  student: Types.ObjectId;
  markedBy: Types.ObjectId;
  branch: Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  class: string;
  section: string;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true,
    },
    class: { type: String, required: true },
    section: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same student on same date
AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
