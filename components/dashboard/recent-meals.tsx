"use client";

import { formatTime } from "@/lib/utils";
import type { Meal } from "@/types/meal";
import { MEAL_TYPE_CONFIG } from "@/types/meal";
import { Trash2, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

interface RecentMealsProps {
  meals: Meal[];
  onDeleteMeal: (id: string) => void;
}

export function RecentMeals({ meals, onDeleteMeal }: RecentMealsProps) {
  if (meals.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 glow-card transition-shadow duration-300">
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          Today&apos;s Meals
        </h2>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <UtensilsCrossed className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            No meals logged today
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Start by scanning your first meal!
          </p>
          <Link
            href="/dashboard/scan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Scan a Meal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 glow-card transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Today&apos;s Meals
        </h2>
        <Link
          href="/dashboard/history"
          className="text-xs text-primary hover:text-primary-light transition-colors font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-3 stagger-children">
        {meals.map((meal) => {
          const config = MEAL_TYPE_CONFIG[meal.type];
          return (
            <div
              key={meal.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-card/50 hover:bg-card transition-colors group"
            >
              <div className="text-2xl flex-shrink-0">{config.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(meal.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {meal.foodItems.map((f) => f.name).join(", ")}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold macro-calories tabular-nums">
                  {Math.round(meal.totalNutrition.calories)} kcal
                </p>
                <p className="text-[10px] text-muted-foreground tabular-nums">
                  P:{Math.round(meal.totalNutrition.protein)}g • C:
                  {Math.round(meal.totalNutrition.carbs)}g • F:
                  {Math.round(meal.totalNutrition.fats)}g
                </p>
              </div>
              <button
                onClick={() => onDeleteMeal(meal.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                aria-label={`Delete ${config.label}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
