import type { MacroNutrients } from "./nutrition";

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: RecipeCategory;
  cuisine: "North Indian" | "South Indian" | "Bengali" | "Gujarati" | "Punjabi" | "Pan-Indian";
  mealType: ("breakfast" | "lunch" | "dinner" | "snack")[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: MacroNutrients; // per serving
  tags: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  imageEmoji: string;
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  isOptional?: boolean;
}

export type RecipeCategory =
  | "Dal & Lentils"
  | "Rice & Biryani"
  | "Roti & Bread"
  | "Curry & Sabzi"
  | "Salad & Raita"
  | "Snacks & Chaat"
  | "Smoothie & Drink"
  | "Dessert"
  | "Eggs & Protein"
  | "Soup";

export interface RecipeFilter {
  category?: RecipeCategory;
  maxCalories?: number;
  minProtein?: number;
  isVegetarian?: boolean;
  difficulty?: "Easy" | "Medium" | "Hard";
  mealType?: string;
  searchQuery?: string;
}
