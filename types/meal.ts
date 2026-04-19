import type { NutritionData } from "./nutrition";

export interface FoodItem {
  name: string;
  quantity: string;
  nutrition: NutritionData;
}

export interface Meal {
  id: string;
  type: MealType;
  foodItems: FoodItem[];
  totalNutrition: NutritionData;
  imageUrl?: string;
  notes?: string;
  timestamp: string;
  date: string; // YYYY-MM-DD format
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export const MEAL_TYPE_CONFIG: Record<
  MealType,
  { label: string; icon: string; color: string; timeRange: string }
> = {
  breakfast: {
    label: "Breakfast",
    icon: "🌅",
    color: "text-amber-500",
    timeRange: "6:00 - 10:00 AM",
  },
  lunch: {
    label: "Lunch",
    icon: "☀️",
    color: "text-orange-500",
    timeRange: "12:00 - 2:00 PM",
  },
  dinner: {
    label: "Dinner",
    icon: "🌙",
    color: "text-indigo-500",
    timeRange: "7:00 - 9:00 PM",
  },
  snack: {
    label: "Snack",
    icon: "🍿",
    color: "text-green-500",
    timeRange: "Anytime",
  },
};
