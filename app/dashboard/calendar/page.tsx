"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGetCalendarData, type CalendarDayData } from "@/lib/api-client";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [days, setDays] = useState<CalendarDayData[]>([]);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarDayData | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await apiGetCalendarData(year, month);
    if (data) {
      setDays(data.days);
      setCalorieGoal(data.calorieGoal ?? 2000);
    }
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDay(null);
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  // Create a map of date -> day data
  const dayMap = new Map<string, CalendarDayData>();
  days.forEach((d) => dayMap.set(d.date, d));

  // Stats for the month
  const daysWithData = days.filter((d) => d.mealCount > 0);
  const daysOnTrack = daysWithData.filter((d) => !d.isOverGoal).length;
  const daysOverGoal = daysWithData.filter((d) => d.isOverGoal).length;
  const avgCalories =
    daysWithData.length > 0
      ? Math.round(
          daysWithData.reduce((s, d) => s + d.totalCalories, 0) /
            daysWithData.length
        )
      : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <CalendarIcon className="w-7 h-7 text-primary" />
          Calendar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your daily calorie goals at a glance
        </p>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-3 gap-3 stagger-children">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">On Track</span>
          </div>
          <p className="text-2xl font-bold text-primary tabular-nums">
            {daysOnTrack}
          </p>
          <p className="text-[10px] text-muted-foreground">days</p>
        </div>

        <div className="glass-card rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Over Goal</span>
          </div>
          <p className="text-2xl font-bold text-destructive tabular-nums">
            {daysOverGoal}
          </p>
          <p className="text-[10px] text-muted-foreground">days</p>
        </div>

        <div className="glass-card rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Flame className="w-4 h-4 text-chart-carbs" />
            <span className="text-xs text-muted-foreground">Avg Cal</span>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {avgCalories}
          </p>
          <p className="text-[10px] text-muted-foreground">kcal/day</p>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="glass-card rounded-2xl p-5">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-foreground">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const dayData = dayMap.get(dateStr);
              const isToday = dateStr === today;
              const hasData = dayData && dayData.mealCount > 0;
              const isOver = dayData?.isOverGoal ?? false;
              const isSelected = selectedDay?.date === dateStr;

              let bgClass = "bg-card/50 hover:bg-card";
              if (hasData && !isOver) bgClass = "bg-primary/15 hover:bg-primary/25 ring-1 ring-primary/20";
              if (hasData && isOver) bgClass = "bg-destructive/15 hover:bg-destructive/25 ring-1 ring-destructive/20";
              if (isSelected) bgClass += " ring-2 ring-primary";

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDay(dayData || null)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 relative ${bgClass}`}
                >
                  {/* Today indicator */}
                  {isToday && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  <span
                    className={`text-sm font-medium tabular-nums ${
                      isToday
                        ? "text-primary font-bold"
                        : hasData
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {hasData && (
                    <span
                      className={`text-[8px] font-bold tabular-nums mt-0.5 ${
                        isOver ? "text-destructive" : "text-primary"
                      }`}
                    >
                      {dayData!.totalCalories}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/30 ring-1 ring-primary/30" />
            <span className="text-xs text-muted-foreground">Under Goal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive/30 ring-1 ring-destructive/30" />
            <span className="text-xs text-muted-foreground">Over Goal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-card/50 border border-border" />
            <span className="text-xs text-muted-foreground">No Data</span>
          </div>
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <div className="glass-card rounded-2xl p-5 animate-fade-in-up relative">
          <button
            onClick={() => setSelectedDay(null)}
            className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close detail"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            {new Date(selectedDay.date + "T00:00:00").toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>

          {/* Status badge */}
          <div className="mb-4">
            {selectedDay.isOverGoal ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-destructive/10 border border-destructive/20">
                <TrendingUp className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  Exceeded goal by{" "}
                  {selectedDay.totalCalories - calorieGoal} kcal
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                <TrendingDown className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Under goal by{" "}
                  {calorieGoal - selectedDay.totalCalories} kcal
                </span>
              </div>
            )}
          </div>

          {/* Macro breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-card/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Calories</p>
              <p className="text-lg font-bold macro-calories tabular-nums">
                {selectedDay.totalCalories}
              </p>
              <p className="text-[10px] text-muted-foreground">
                / {calorieGoal} kcal
              </p>
            </div>
            <div className="bg-card/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Protein</p>
              <p className="text-lg font-bold macro-protein tabular-nums">
                {selectedDay.totalProtein}g
              </p>
            </div>
            <div className="bg-card/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Carbs</p>
              <p className="text-lg font-bold macro-carbs tabular-nums">
                {selectedDay.totalCarbs}g
              </p>
            </div>
            <div className="bg-card/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Fats</p>
              <p className="text-lg font-bold macro-fats tabular-nums">
                {selectedDay.totalFats}g
              </p>
            </div>
            <div className="bg-card/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Fiber</p>
              <p className="text-lg font-bold macro-fiber tabular-nums">
                {selectedDay.totalFiber}g
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            {selectedDay.mealCount} meal{selectedDay.mealCount !== 1 ? "s" : ""}{" "}
            logged this day
          </p>
        </div>
      )}

      {/* Goal info */}
      <div className="glass-card rounded-2xl p-4 border-l-4 border-primary/50">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">🎯 Your Daily Goal:</strong>{" "}
          {calorieGoal} kcal — Days are marked green when you stay within your
          calorie goal and red when you exceed it. Update your goal in{" "}
          <span className="text-primary font-medium">Settings</span>.
        </p>
      </div>
    </div>
  );
}
