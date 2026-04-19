import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  water: number;
}

const goalSchema = new Schema<IGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    calories: { type: Number, default: 2000 },
    protein: { type: Number, default: 60 },
    carbs: { type: Number, default: 250 },
    fats: { type: Number, default: 65 },
    fiber: { type: Number, default: 25 },
    water: { type: Number, default: 3000 },
  },
  { timestamps: true }
);

const GoalModel: Model<IGoal> =
  mongoose.models.Goal || mongoose.model<IGoal>("Goal", goalSchema);

export default GoalModel;
