"use client";

import { useEffect, useState, useMemo } from "react";
import { apiGetMeals, apiGetGoals } from "@/lib/api-client";
import { getToday } from "@/lib/utils";
import type { Meal } from "@/types/meal";
import type { DailyGoals } from "@/types/nutrition";
import { DEFAULT_DAILY_GOALS } from "@/types/nutrition";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Flame,
  Target,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

export default function AnalyticsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoalsState] = useState<DailyGoals>(DEFAULT_DAILY_GOALS);
  const [period, setPeriod] = useState<"7" | "14" | "30">("7");

  useEffect(() => {
    async function loadData() {
      const [mealsRes, goalsRes] = await Promise.all([
        apiGetMeals(),
        apiGetGoals(),
      ]);

      if (mealsRes.data?.meals) {
        const sorted = (mealsRes.data.meals as unknown as Meal[]).sort(
          (a, b) => a.timestamp.localeCompare(b.timestamp)
        );
        setMeals(sorted);
      }
      if (goalsRes.data) {
        setGoalsState(goalsRes.data as DailyGoals);
      }
    }
    loadData();
  }, []);

  // Calculate date range
  const dateRange = useMemo(() => {
    const end = new Date(getToday());
    const start = new Date(end);
    start.setDate(start.getDate() - Number(period) + 1);

    const dates: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [period]);

  // Daily data
  const dailyData = useMemo(() => {
    return dateRange.map((date) => {
      const dayMeals = meals.filter((m) => m.date === date);
      const totals = dayMeals.reduce(
        (acc, m) => ({
          calories: acc.calories + m.totalNutrition.calories,
          protein: acc.protein + m.totalNutrition.protein,
          carbs: acc.carbs + m.totalNutrition.carbs,
          fats: acc.fats + m.totalNutrition.fats,
          fiber: acc.fiber + m.totalNutrition.fiber,
          meals: acc.meals + 1,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, meals: 0 }
      );

      const d = new Date(date);
      return {
        date,
        label: d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        shortLabel: d.toLocaleDateString("en-IN", { weekday: "short" }),
        ...totals,
      };
    });
  }, [dateRange, meals]);

  // Summary stats
  const stats = useMemo(() => {
    const daysWithData = dailyData.filter((d) => d.meals > 0);
    const totalDays = daysWithData.length;
    if (totalDays === 0)
      return {
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFats: 0,
        totalMeals: 0,
        streak: 0,
        daysOnTrack: 0,
      };

    const avgCalories = Math.round(
      daysWithData.reduce((s, d) => s + d.calories, 0) / totalDays
    );
    const avgProtein = Math.round(
      daysWithData.reduce((s, d) => s + d.protein, 0) / totalDays
    );
    const avgCarbs = Math.round(
      daysWithData.reduce((s, d) => s + d.carbs, 0) / totalDays
    );
    const avgFats = Math.round(
      daysWithData.reduce((s, d) => s + d.fats, 0) / totalDays
    );
    const totalMeals = daysWithData.reduce((s, d) => s + d.meals, 0);
    const daysOnTrack = daysWithData.filter(
      (d) => d.calories <= goals.calories * 1.1
    ).length;

    // Calculate streak
    let streak = 0;
    for (let i = dailyData.length - 1; i >= 0; i--) {
      if (dailyData[i].meals > 0) streak++;
      else break;
    }

    return {
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFats,
      totalMeals,
      streak,
      daysOnTrack,
    };
  }, [dailyData, goals]);

  // Macro distribution for pie chart (based on averages)
  const macroDistribution = useMemo(() => {
    const proteinCals = stats.avgProtein * 4;
    const carbsCals = stats.avgCarbs * 4;
    const fatsCals = stats.avgFats * 9;
    const total = proteinCals + carbsCals + fatsCals;
    if (total === 0) return [];

    return [
      {
        name: "Protein",
        value: Math.round((proteinCals / total) * 100),
        color: "var(--chart-protein)",
        cals: proteinCals,
      },
      {
        name: "Carbs",
        value: Math.round((carbsCals / total) * 100),
        color: "var(--chart-carbs)",
        cals: carbsCals,
      },
      {
        name: "Fats",
        value: Math.round((fatsCals / total) * 100),
        color: "var(--chart-fats)",
        cals: fatsCals,
      },
    ];
  }, [stats]);

  const CHART_COLORS = {
    calories: "var(--chart-calories)",
    protein: "var(--chart-protein)",
    carbs: "var(--chart-carbs)",
    fats: "var(--chart-fats)",
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" />
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your nutrition trends and insights
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 bg-card rounded-xl p-1 border border-border">
          {(["7", "14", "30"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}D
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Avg Calories</span>
          </div>
          <p className="text-2xl font-bold macro-calories tabular-nums">
            {stats.avgCalories}
          </p>
          <p className="text-xs text-muted-foreground">kcal/day</p>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-chart-protein" />
            <span className="text-xs text-muted-foreground">Avg Protein</span>
          </div>
          <p className="text-2xl font-bold macro-protein tabular-nums">
            {stats.avgProtein}g
          </p>
          <p className="text-xs text-muted-foreground">per day</p>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-chart-carbs" />
            <span className="text-xs text-muted-foreground">Streak</span>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {stats.streak}
          </p>
          <p className="text-xs text-muted-foreground">consecutive days</p>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            {stats.daysOnTrack >= Math.ceil(Number(period) * 0.7) ? (
              <TrendingUp className="w-4 h-4 text-primary" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
            <span className="text-xs text-muted-foreground">On Track</span>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {stats.daysOnTrack}/{dailyData.length}
          </p>
          <p className="text-xs text-muted-foreground">days within goal</p>
        </div>
      </div>

      {/* Calorie Bar Chart */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Daily Calories
        </h3>
        <div className="h-64">
          {dailyData.some((d) => d.meals > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey={Number(period) <= 14 ? "shortLabel" : "label"}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "var(--foreground)",
                  }}
                  labelStyle={{ color: "var(--foreground)" }}
                />
                <Bar
                  dataKey="calories"
                  fill={CHART_COLORS.calories}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No data to display yet. Start logging meals!
            </div>
          )}
        </div>
      </div>

      {/* Two column: Macro Trend + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Macro Trend */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Macro Trends
          </h3>
          <div className="h-64">
            {dailyData.some((d) => d.meals > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={35}
                    unit="g"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "var(--foreground)",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px" }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Line
                    type="monotone"
                    dataKey="protein"
                    stroke={CHART_COLORS.protein}
                    strokeWidth={2}
                    dot={false}
                    name="Protein"
                  />
                  <Line
                    type="monotone"
                    dataKey="carbs"
                    stroke={CHART_COLORS.carbs}
                    strokeWidth={2}
                    dot={false}
                    name="Carbs"
                  />
                  <Line
                    type="monotone"
                    dataKey="fats"
                    stroke={CHART_COLORS.fats}
                    strokeWidth={2}
                    dot={false}
                    name="Fats"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No data to display yet
              </div>
            )}
          </div>
        </div>

        {/* Macro Distribution Pie */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Macro Distribution
          </h3>
          <div className="h-64">
            {macroDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {macroDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "var(--foreground)",
                    }}
                    formatter={(value) => [`${value}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No data to display yet
              </div>
            )}
          </div>
          {macroDistribution.length > 0 && (
            <div className="flex justify-center gap-6 mt-2">
              {macroDistribution.map((m) => (
                <div key={m.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="text-xs text-foreground">
                    {m.name}{" "}
                    <strong className="tabular-nums">{m.value}%</strong>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
