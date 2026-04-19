"use client";

import { useEffect, useState, useCallback } from "react";
import {
  apiGetVitamins,
  apiAddVitamin,
  apiDeleteVitamin,
  apiGetVitaminLogs,
  apiToggleVitaminLog,
} from "@/lib/api-client";
import { getToday, cn } from "@/lib/utils";
import type { Vitamin } from "@/types/vitamin";
import { DEFAULT_VITAMINS } from "@/types/vitamin";
import {
  Pill,
  Plus,
  X,
  Check,
  Trash2,
  Sparkles,
  Sun,
  Moon,
  Sunset,
  CloudMoon,
} from "lucide-react";

const TIME_ICONS = {
  morning: Sun,
  afternoon: Sunset,
  evening: CloudMoon,
  night: Moon,
};

interface VitaminWithStatus extends Vitamin {
  takenToday: boolean;
}

export default function VitaminsPage() {
  const [vitamins, setVitaminsState] = useState<VitaminWithStatus[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showDefaults, setShowDefaults] = useState(false);
  const [newVitamin, setNewVitamin] = useState({
    name: "",
    dosage: "",
    timeOfDay: "morning" as Vitamin["timeOfDay"],
  });
  const today = getToday();

  const loadData = useCallback(async () => {
    const [vitRes, logRes] = await Promise.all([
      apiGetVitamins(),
      apiGetVitaminLogs(today),
    ]);

    if (vitRes.data?.vitamins) {
      const logs = logRes.data?.logs || [];
      const withStatus: VitaminWithStatus[] = vitRes.data.vitamins.map(
        (v) => ({
          id: v._id || v.id,
          name: v.name,
          dosage: v.dosage,
          frequency: v.frequency as Vitamin["frequency"],
          timeOfDay: v.timeOfDay as Vitamin["timeOfDay"],
          notes: v.notes,
          color: v.color,
          icon: v.icon,
          takenToday: logs.some(
            (l) => l.vitaminId === (v._id || v.id) && l.taken
          ),
        })
      ) as VitaminWithStatus[];
      setVitaminsState(withStatus);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = async (vitaminId: string) => {
    await apiToggleVitaminLog(vitaminId, today);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await apiDeleteVitamin(id);
    loadData();
  };

  const handleAdd = async () => {
    if (!newVitamin.name || !newVitamin.dosage) return;

    await apiAddVitamin({
      name: newVitamin.name,
      dosage: newVitamin.dosage,
      frequency: "daily",
      timeOfDay: newVitamin.timeOfDay,
      color: getRandomColor(),
      icon: "💊",
    });

    setNewVitamin({ name: "", dosage: "", timeOfDay: "morning" });
    setShowAdd(false);
    loadData();
  };

  const handleLoadDefaults = async () => {
    const currentNames = vitamins.map((v) => v.name);
    const newVits = DEFAULT_VITAMINS.filter(
      (dv) => !currentNames.includes(dv.name)
    );

    for (const v of newVits) {
      await apiAddVitamin({
        name: v.name,
        dosage: v.dosage,
        frequency: v.frequency,
        timeOfDay: v.timeOfDay,
        color: v.color,
        icon: v.icon,
      });
    }

    setShowDefaults(false);
    loadData();
  };

  const takenCount = vitamins.filter((v) => v.takenToday).length;
  const totalCount = vitamins.length;
  const completionPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  // Group by time of day
  const grouped = {
    morning: vitamins.filter((v) => v.timeOfDay === "morning"),
    afternoon: vitamins.filter((v) => v.timeOfDay === "afternoon"),
    evening: vitamins.filter((v) => v.timeOfDay === "evening"),
    night: vitamins.filter((v) => v.timeOfDay === "night"),
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <Pill className="w-7 h-7 text-primary" />
            Vitamin Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your daily supplements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Vitamin
          </button>
        </div>
      </div>

      {/* Progress */}
      {totalCount > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              Today&apos;s Progress
            </span>
            <span className="text-sm font-bold text-primary tabular-nums">
              {takenCount}/{totalCount}
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-700 ease-out"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          {completionPercent === 100 && (
            <p className="text-xs text-primary mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              All supplements taken for today! 🎉
            </p>
          )}
        </div>
      )}

      {/* Empty state */}
      {totalCount === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Pill className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            No vitamins added yet. Start tracking your supplements!
          </p>
          <button
            onClick={() => setShowDefaults(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Load Common Supplements
          </button>
        </div>
      )}

      {/* Load defaults dialog */}
      {showDefaults && (
        <div className="glass-card rounded-2xl p-5 border-2 border-primary/30">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Add common supplements?
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            This will add: Vitamin D3, B12, Omega-3, Multivitamin, Calcium+Magnesium, Iron, Zinc, and Ashwagandha
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDefaults(false)}
              className="flex-1 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLoadDefaults}
              className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Add All
            </button>
          </div>
        </div>
      )}

      {/* Add vitamin form */}
      {showAdd && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Add New Vitamin
            </h3>
            <button
              onClick={() => setShowAdd(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <input
              type="text"
              placeholder="Vitamin name"
              value={newVitamin.name}
              onChange={(e) =>
                setNewVitamin((p) => ({ ...p, name: e.target.value }))
              }
              className="px-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <input
              type="text"
              placeholder="Dosage (e.g., 1000 IU)"
              value={newVitamin.dosage}
              onChange={(e) =>
                setNewVitamin((p) => ({ ...p, dosage: e.target.value }))
              }
              className="px-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <select
              value={newVitamin.timeOfDay}
              onChange={(e) =>
                setNewVitamin((p) => ({
                  ...p,
                  timeOfDay: e.target.value as Vitamin["timeOfDay"],
                }))
              }
              className="px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </div>

          <button
            onClick={handleAdd}
            disabled={!newVitamin.name || !newVitamin.dosage}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Vitamin
          </button>
        </div>
      )}

      {/* Vitamin Groups */}
      {totalCount > 0 && (
        <div className="space-y-6 stagger-children">
          {(
            Object.entries(grouped) as [
              keyof typeof grouped,
              VitaminWithStatus[],
            ][]
          )
            .filter(([, vits]) => vits.length > 0)
            .map(([timeOfDay, vits]) => {
              const TimeIcon = TIME_ICONS[timeOfDay];
              return (
                <div key={timeOfDay}>
                  <div className="flex items-center gap-2 mb-3">
                    <TimeIcon className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground capitalize">
                      {timeOfDay}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vits.map((vitamin) => (
                      <div
                        key={vitamin.id}
                        className={cn(
                          "glass-card rounded-xl p-4 flex items-center gap-4 transition-all duration-300 group cursor-pointer",
                          vitamin.takenToday && "ring-2 ring-primary/30 bg-primary/5"
                        )}
                        onClick={() => handleToggle(vitamin.id)}
                      >
                        {/* Check Circle */}
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                            vitamin.takenToday
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {vitamin.takenToday ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <span className="text-lg">{vitamin.icon}</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-semibold transition-colors",
                              vitamin.takenToday
                                ? "text-primary line-through"
                                : "text-foreground"
                            )}
                          >
                            {vitamin.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vitamin.dosage}
                          </p>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(vitamin.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          aria-label="Delete vitamin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Tip */}
      {totalCount > 0 && !showAdd && (
        <div className="glass-card rounded-2xl p-4 border-l-4 border-primary/50">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">💡 Tip:</strong> Click on a
            vitamin to mark it as taken. Your progress is saved automatically.
          </p>
        </div>
      )}
    </div>
  );
}

function getRandomColor(): string {
  const colors = [
    "#22a55b",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
