import type { Meal } from "@/types/meal";
import type { DailyGoals } from "@/types/nutrition";
import type { Vitamin, VitaminLog } from "@/types/vitamin";
import { DEFAULT_DAILY_GOALS } from "@/types/nutrition";

const KEYS = {
  MEALS: "caltracker_meals",
  GOALS: "caltracker_goals",
  VITAMINS: "caltracker_vitamins",
  VITAMIN_LOGS: "caltracker_vitamin_logs",
  WATER_INTAKE: "caltracker_water_intake",
  ONBOARDED: "caltracker_onboarded",
} as const;

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage: ${key}`, error);
  }
}

// ─── Meals ───────────────────────────────────────────────────────────────────

export function getMeals(): Meal[] {
  return getItem<Meal[]>(KEYS.MEALS, []);
}

export function getMealsByDate(date: string): Meal[] {
  return getMeals().filter((m) => m.date === date);
}

export function addMeal(meal: Meal): void {
  const meals = getMeals();
  meals.push(meal);
  setItem(KEYS.MEALS, meals);
}

export function deleteMeal(id: string): void {
  const meals = getMeals().filter((m) => m.id !== id);
  setItem(KEYS.MEALS, meals);
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export function getGoals(): DailyGoals {
  return getItem<DailyGoals>(KEYS.GOALS, DEFAULT_DAILY_GOALS);
}

export function setGoals(goals: DailyGoals): void {
  setItem(KEYS.GOALS, goals);
}

// ─── Vitamins ────────────────────────────────────────────────────────────────

export function getVitamins(): Vitamin[] {
  return getItem<Vitamin[]>(KEYS.VITAMINS, []);
}

export function addVitamin(vitamin: Vitamin): void {
  const vitamins = getVitamins();
  vitamins.push(vitamin);
  setItem(KEYS.VITAMINS, vitamins);
}

export function removeVitamin(id: string): void {
  const vitamins = getVitamins().filter((v) => v.id !== id);
  setItem(KEYS.VITAMINS, vitamins);
}

export function setVitamins(vitamins: Vitamin[]): void {
  setItem(KEYS.VITAMINS, vitamins);
}

// ─── Vitamin Logs ────────────────────────────────────────────────────────────

export function getVitaminLogs(): VitaminLog[] {
  return getItem<VitaminLog[]>(KEYS.VITAMIN_LOGS, []);
}

export function toggleVitaminLog(vitaminId: string, date: string): void {
  const logs = getVitaminLogs();
  const existingIndex = logs.findIndex(
    (l) => l.vitaminId === vitaminId && l.date === date
  );

  if (existingIndex >= 0) {
    logs[existingIndex].taken = !logs[existingIndex].taken;
    logs[existingIndex].timestamp = new Date().toISOString();
  } else {
    logs.push({
      vitaminId,
      date,
      taken: true,
      timestamp: new Date().toISOString(),
    });
  }

  setItem(KEYS.VITAMIN_LOGS, logs);
}

export function isVitaminTaken(vitaminId: string, date: string): boolean {
  const logs = getVitaminLogs();
  const log = logs.find((l) => l.vitaminId === vitaminId && l.date === date);
  return log?.taken ?? false;
}

// ─── Water Intake ────────────────────────────────────────────────────────────

export function getWaterIntake(date: string): number {
  const data = getItem<Record<string, number>>(KEYS.WATER_INTAKE, {});
  return data[date] ?? 0;
}

export function addWaterIntake(date: string, amount: number): void {
  const data = getItem<Record<string, number>>(KEYS.WATER_INTAKE, {});
  data[date] = (data[date] ?? 0) + amount;
  setItem(KEYS.WATER_INTAKE, data);
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export function isOnboarded(): boolean {
  return getItem<boolean>(KEYS.ONBOARDED, false);
}

export function setOnboarded(): void {
  setItem(KEYS.ONBOARDED, true);
}
