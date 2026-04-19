export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface MicroNutrients {
  vitaminA?: number;
  vitaminB12?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  iron?: number;
  calcium?: number;
  zinc?: number;
  magnesium?: number;
  potassium?: number;
  sodium?: number;
}

export interface NutritionData extends MacroNutrients {
  microNutrients?: MicroNutrients;
}

export interface DailyGoals extends MacroNutrients {
  water: number; // in ml
}

export const DEFAULT_DAILY_GOALS: DailyGoals = {
  calories: 2000,
  protein: 60,
  carbs: 250,
  fats: 65,
  fiber: 25,
  water: 3000,
};
