import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IVitamin extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  dosage: string;
  frequency: "daily" | "weekly" | "as-needed";
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  notes?: string;
  color: string;
  icon: string;
}

const vitaminSchema = new Schema<IVitamin>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "as-needed"],
      default: "daily",
    },
    timeOfDay: {
      type: String,
      enum: ["morning", "afternoon", "evening", "night"],
      default: "morning",
    },
    notes: String,
    color: { type: String, default: "#22a55b" },
    icon: { type: String, default: "💊" },
  },
  { timestamps: true }
);

const VitaminModel: Model<IVitamin> =
  mongoose.models.Vitamin ||
  mongoose.model<IVitamin>("Vitamin", vitaminSchema);

export default VitaminModel;

// ─── Vitamin Log ─────────────────────────────────────────────────────────────

export interface IVitaminLog extends Document {
  userId: mongoose.Types.ObjectId;
  vitaminId: mongoose.Types.ObjectId;
  date: string;
  taken: boolean;
  timestamp: string;
}

const vitaminLogSchema = new Schema<IVitaminLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vitaminId: {
      type: Schema.Types.ObjectId,
      ref: "Vitamin",
      required: true,
    },
    date: { type: String, required: true },
    taken: { type: Boolean, default: false },
    timestamp: { type: String },
  },
  { timestamps: true }
);

vitaminLogSchema.index({ userId: 1, vitaminId: 1, date: 1 }, { unique: true });

export const VitaminLogModel: Model<IVitaminLog> =
  mongoose.models.VitaminLog ||
  mongoose.model<IVitaminLog>("VitaminLog", vitaminLogSchema);
