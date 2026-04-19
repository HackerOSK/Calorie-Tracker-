import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getProgressColor(percentage: number): string {
  if (percentage < 50) return "text-red-500";
  if (percentage < 75) return "text-amber-500";
  if (percentage <= 100) return "text-emerald-500";
  return "text-red-500"; // over limit
}

export function clampPercentage(value: number, max: number): number {
  return Math.min(Math.round((value / max) * 100), 100);
}
