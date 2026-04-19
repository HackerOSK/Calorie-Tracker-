"use client";

import { useEffect, useMemo, useState } from "react";

interface MacroRingProps {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
  size?: number;
  strokeWidth?: number;
}

export function MacroRing({
  label,
  value,
  goal,
  unit,
  color,
  size = 120,
  strokeWidth = 8,
}: MacroRingProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((animatedValue / goal) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const isOver = value > goal;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/50"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${color}40)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-xl font-bold tabular-nums"
            style={{ color: isOver ? "var(--destructive)" : color }}
          >
            {Math.round(value)}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {unit}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          of {goal}
          {unit}
        </p>
      </div>
    </div>
  );
}

interface MacroRingsRowProps {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
}

export function MacroRingsRow({
  calories,
  protein,
  carbs,
  fats,
  fiber,
  goals,
}: MacroRingsRowProps) {
  const macros = useMemo(
    () => [
      {
        label: "Calories",
        value: calories,
        goal: goals.calories,
        unit: "kcal",
        color: "var(--chart-calories)",
        size: 130,
      },
      {
        label: "Protein",
        value: protein,
        goal: goals.protein,
        unit: "g",
        color: "var(--chart-protein)",
      },
      {
        label: "Carbs",
        value: carbs,
        goal: goals.carbs,
        unit: "g",
        color: "var(--chart-carbs)",
      },
      {
        label: "Fats",
        value: fats,
        goal: goals.fats,
        unit: "g",
        color: "var(--chart-fats)",
      },
      {
        label: "Fiber",
        value: fiber,
        goal: goals.fiber,
        unit: "g",
        color: "var(--chart-fiber)",
      },
    ],
    [calories, protein, carbs, fats, fiber, goals]
  );

  return (
    <div className="glass-card rounded-2xl p-6 glow-card transition-shadow duration-300">
      <h2 className="text-lg font-semibold mb-5 text-foreground">
        Today&apos;s Progress
      </h2>
      <div className="flex items-end justify-around gap-2 flex-wrap">
        {macros.map((macro) => (
          <MacroRing key={macro.label} {...macro} />
        ))}
      </div>
    </div>
  );
}
