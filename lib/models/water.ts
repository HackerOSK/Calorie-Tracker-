import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IWaterIntake extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  amount: number; // in ml
}

const waterIntakeSchema = new Schema<IWaterIntake>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: String, required: true },
    amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

waterIntakeSchema.index({ userId: 1, date: 1 }, { unique: true });

const WaterIntakeModel: Model<IWaterIntake> =
  mongoose.models.WaterIntake ||
  mongoose.model<IWaterIntake>("WaterIntake", waterIntakeSchema);

export default WaterIntakeModel;
