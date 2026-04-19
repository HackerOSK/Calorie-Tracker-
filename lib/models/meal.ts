import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IMeal extends Document {
  userId: mongoose.Types.ObjectId;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  foodItems: Array<{
    name: string;
    quantity: string;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      fiber: number;
    };
  }>;
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  imageUrl?: string;
  notes?: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
}

const nutritionSchema = new Schema(
  {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
  },
  { _id: false }
);

const foodItemSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String, required: true },
    nutrition: { type: nutritionSchema, required: true },
  },
  { _id: false }
);

const mealSchema = new Schema<IMeal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    foodItems: [foodItemSchema],
    totalNutrition: { type: nutritionSchema, required: true },
    imageUrl: String,
    notes: String,
    timestamp: { type: String, required: true },
    date: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// Compound index for efficient user+date queries
mealSchema.index({ userId: 1, date: 1 });

const MealModel: Model<IMeal> =
  mongoose.models.Meal || mongoose.model<IMeal>("Meal", mealSchema);

export default MealModel;
