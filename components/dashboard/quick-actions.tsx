"use client";

import Link from "next/link";
import { Camera, ChefHat, Pill, Droplets, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  waterIntake: number;
  waterGoal: number;
  onAddWater: (amount: number) => void;
}

export function QuickActions({
  waterIntake,
  waterGoal,
  onAddWater,
}: QuickActionsProps) {
  const waterPercent = Math.min(Math.round((waterIntake / waterGoal) * 100), 100);

  return (
    <div className="glass-card rounded-2xl p-6 glow-card transition-shadow duration-300">
      <h2 className="text-lg font-semibold mb-4 text-foreground">
        Quick Actions
      </h2>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Link
          href="/dashboard/scan"
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors group"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Camera className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-foreground">Scan Meal</span>
        </Link>

        <Link
          href="/dashboard/recipes"
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-chart-carbs/10 hover:bg-chart-carbs/20 transition-colors group"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-medium text-foreground">Recipes</span>
        </Link>

        <Link
          href="/dashboard/vitamins"
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-chart-fiber/10 hover:bg-chart-fiber/20 transition-colors group"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-medium text-foreground">Vitamins</span>
        </Link>
      </div>

      {/* Water Tracker */}
      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-foreground">
              Water Intake
            </span>
          </div>
          <span className="text-sm text-muted-foreground tabular-nums">
            {(waterIntake / 1000).toFixed(1)}L / {(waterGoal / 1000).toFixed(1)}L
          </span>
        </div>

        {/* Water progress bar */}
        <div className="h-3 rounded-full bg-muted overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out"
            style={{ width: `${waterPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onAddWater(-250)}
            disabled={waterIntake <= 0}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
              waterIntake <= 0
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
            )}
            aria-label="Remove 250ml water"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-blue-500 min-w-[60px] text-center">
            +250ml
          </span>
          <button
            onClick={() => onAddWater(250)}
            className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 flex items-center justify-center transition-colors"
            aria-label="Add 250ml water"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
