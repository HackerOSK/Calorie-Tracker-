"use client";

import { useEffect, useState, useMemo } from "react";
import { apiGetMeals, apiDeleteMeal } from "@/lib/api-client";
import { formatDate, formatTime } from "@/lib/utils";
import type { Meal } from "@/types/meal";
import { MEAL_TYPE_CONFIG } from "@/types/meal";
import { History, Trash2, Search, ChevronDown, ChevronUp } from "lucide-react";

export default function HistoryPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeals() {
      const { data } = await apiGetMeals();
      if (data?.meals) {
        const sorted = (data.meals as unknown as Meal[]).sort((a, b) =>
          b.timestamp.localeCompare(a.timestamp)
        );
        setMeals(sorted);
      }
    }
    loadMeals();
  }, []);

  const handleDelete = async (id: string) => {
    await apiDeleteMeal(id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  // Filter and group by date
  const filteredMeals = useMemo(() => {
    if (!searchQuery) return meals;
    const q = searchQuery.toLowerCase();
    return meals.filter(
      (m) =>
        m.foodItems.some((f) => f.name.toLowerCase().includes(q)) ||
        MEAL_TYPE_CONFIG[m.type].label.toLowerCase().includes(q)
    );
  }, [meals, searchQuery]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Meal[]> = {};
    filteredMeals.forEach((meal) => {
      if (!groups[meal.date]) groups[meal.date] = [];
      groups[meal.date].push(meal);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredMeals]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <History className="w-7 h-7 text-primary" />
          Meal History
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meals.length} meals logged total
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search meals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Grouped meals */}
      {groupedByDate.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <History className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? "No meals match your search"
              : "No meals logged yet. Start scanning!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {groupedByDate.map(([date, dateMeals]) => {
            const dailyTotal = dateMeals.reduce(
              (sum, m) => sum + m.totalNutrition.calories,
              0
            );
            const isExpanded =
              expandedDate === date || expandedDate === null;

            return (
              <div
                key={date}
                className="glass-card rounded-2xl overflow-hidden"
              >
                {/* Date header */}
                <button
                  onClick={() =>
                    setExpandedDate(isExpanded && expandedDate !== null ? null : date)
                  }
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {formatDate(date)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {dateMeals.length} meals
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold macro-calories tabular-nums">
                      {Math.round(dailyTotal)} kcal
                    </span>
                    {isExpanded && expandedDate !== null ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Meal items */}
                {isExpanded && (
                  <div className="px-5 pb-4 space-y-2">
                    {dateMeals.map((meal) => {
                      const config = MEAL_TYPE_CONFIG[meal.type];
                      return (
                        <div
                          key={meal.id}
                          className="flex items-center gap-4 p-3 rounded-xl bg-card/50 hover:bg-card transition-colors group"
                        >
                          <span className="text-xl flex-shrink-0">
                            {config.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-semibold text-foreground">
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
                            onClick={() => handleDelete(meal.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            aria-label="Delete meal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
