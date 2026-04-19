"use client";

import { useEffect, useState } from "react";
import { apiGetGoals, apiSetGoals } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { DailyGoals } from "@/types/nutrition";
import { DEFAULT_DAILY_GOALS } from "@/types/nutrition";
import { Settings, Save, RotateCcw, Check } from "lucide-react";

export default function SettingsPage() {
  const [goals, setGoalsState] = useState<DailyGoals>(DEFAULT_DAILY_GOALS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadGoals() {
      const { data } = await apiGetGoals();
      if (data) {
        setGoalsState(data as DailyGoals);
      }
    }
    loadGoals();
  }, []);

  const handleSave = async () => {
    await apiSetGoals(goals);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = async () => {
    setGoalsState(DEFAULT_DAILY_GOALS);
    await apiSetGoals(DEFAULT_DAILY_GOALS);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (field: keyof DailyGoals, value: string) => {
    const numValue = Number(value) || 0;
    setGoalsState((prev) => ({ ...prev, [field]: numValue }));
  };

  const GOAL_FIELDS: {
    key: keyof DailyGoals;
    label: string;
    unit: string;
    color: string;
    min: number;
    max: number;
    step: number;
  }[] = [
    {
      key: "calories",
      label: "Daily Calories",
      unit: "kcal",
      color: "macro-calories",
      min: 500,
      max: 5000,
      step: 50,
    },
    {
      key: "protein",
      label: "Protein",
      unit: "g",
      color: "macro-protein",
      min: 10,
      max: 300,
      step: 5,
    },
    {
      key: "carbs",
      label: "Carbohydrates",
      unit: "g",
      color: "macro-carbs",
      min: 50,
      max: 500,
      step: 10,
    },
    {
      key: "fats",
      label: "Fats",
      unit: "g",
      color: "macro-fats",
      min: 10,
      max: 200,
      step: 5,
    },
    {
      key: "fiber",
      label: "Fiber",
      unit: "g",
      color: "macro-fiber",
      min: 5,
      max: 60,
      step: 1,
    },
    {
      key: "water",
      label: "Water Intake",
      unit: "ml",
      color: "text-blue-500",
      min: 1000,
      max: 6000,
      step: 250,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <Settings className="w-7 h-7 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your daily nutrition goals
        </p>
      </div>

      {/* Goals Form */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-semibold text-foreground mb-5">
          Daily Nutrition Goals
        </h2>

        <div className="space-y-5">
          {GOAL_FIELDS.map((field) => (
            <div key={field.key}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">
                  {field.label}
                </label>
                <span
                  className={`text-sm font-bold tabular-nums ${field.color}`}
                >
                  {goals[field.key]} {field.unit}
                </span>
              </div>
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={goals[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-primary"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">
                  {field.min} {field.unit}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {field.max} {field.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
            saved
              ? "bg-primary/20 text-primary"
              : "bg-gradient-to-r from-primary to-primary-light text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
          )}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Goals
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="glass-card rounded-2xl p-4 border-l-4 border-primary/50">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">ℹ️ About Data:</strong> Your
          data is securely stored in the cloud. Sign in from any device to
          access your nutrition goals and meal history.
        </p>
      </div>
    </div>
  );
}
