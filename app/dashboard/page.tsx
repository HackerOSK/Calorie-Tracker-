"use client";

import { useEffect, useState, useCallback } from "react";
import { MacroRingsRow } from "@/components/dashboard/macro-ring";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentMeals } from "@/components/dashboard/recent-meals";
import {
  apiGetMeals,
  apiDeleteMeal,
  apiGetGoals,
  apiGetWater,
  apiAddWater,
} from "@/lib/api-client";
import { getToday, formatDate } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import type { Meal } from "@/types/meal";
import type { DailyGoals } from "@/types/nutrition";
import { DEFAULT_DAILY_GOALS } from "@/types/nutrition";
import { Flame, TrendingUp, Calendar } from "lucide-react";

export default function DashboardPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<DailyGoals>(DEFAULT_DAILY_GOALS);
  const [waterIntake, setWaterIntakeState] = useState(0);
  const { user } = useAuth();
  const today = getToday();

  const loadData = useCallback(async () => {
    const [mealsRes, goalsRes, waterRes] = await Promise.all([
      apiGetMeals(today),
      apiGetGoals(),
      apiGetWater(today),
    ]);

    if (mealsRes.data?.meals) {
      setMeals(mealsRes.data.meals as unknown as Meal[]);
    }
    if (goalsRes.data) {
      setGoals(goalsRes.data as DailyGoals);
    }
    if (waterRes.data) {
      setWaterIntakeState(waterRes.data.amount);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute totals
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.totalNutrition.calories,
      protein: acc.protein + meal.totalNutrition.protein,
      carbs: acc.carbs + meal.totalNutrition.carbs,
      fats: acc.fats + meal.totalNutrition.fats,
      fiber: acc.fiber + meal.totalNutrition.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
  );

  const handleDeleteMeal = async (id: string) => {
    await apiDeleteMeal(id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddWater = async (amount: number) => {
    const res = await apiAddWater(today, amount);
    if (res.data) {
      setWaterIntakeState(res.data.amount);
    }
  };

  const caloriesRemaining = goals.calories - totals.calories;
  const mealsCount = meals.length;

  const greeting = user?.name
    ? user.name.split(" ")[0]
    : "there";

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Good {getGreeting()},{" "}
            <span className="gradient-text">{greeting}!</span> 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(today)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Calories remaining badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
            <Flame className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p
                className={`text-sm font-bold tabular-nums ${
                  caloriesRemaining >= 0
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {Math.abs(Math.round(caloriesRemaining))} kcal
                {caloriesRemaining < 0 && " over"}
              </p>
            </div>
          </div>

          {/* Meals count badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
            <TrendingUp className="w-4 h-4 text-chart-protein" />
            <div>
              <p className="text-xs text-muted-foreground">Meals</p>
              <p className="text-sm font-bold tabular-nums text-foreground">
                {mealsCount} logged
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Macro Rings */}
      <MacroRingsRow
        calories={totals.calories}
        protein={totals.protein}
        carbs={totals.carbs}
        fats={totals.fats}
        fiber={totals.fiber}
        goals={goals}
      />

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions
          waterIntake={waterIntake}
          waterGoal={goals.water}
          onAddWater={handleAddWater}
        />
        <RecentMeals meals={meals} onDeleteMeal={handleDeleteMeal} />
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
