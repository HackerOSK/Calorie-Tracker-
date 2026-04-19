"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, X, Loader2, Check, ArrowLeft, Pencil } from "lucide-react";
import { cn, getToday } from "@/lib/utils";
import { apiAddMeal } from "@/lib/api-client";
import type { MealType } from "@/types/meal";
import { MEAL_TYPE_CONFIG } from "@/types/meal";
import type { FoodItem } from "@/types/meal";
import Link from "next/link";

type ScanStep = "upload" | "analyzing" | "results" | "confirm";

interface AnalysisResult {
  foodItems: Array<{
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  mealDescription: string;
}

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ScanStep>("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    getDefaultMealType()
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleFile = useCallback((file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setStep("analyzing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze meal");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
      setStep("results");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze meal. Please try again."
      );
      setStep("upload");
    }
  };

  const handleSaveMeal = async () => {
    if (!result) return;

    const foodItems: FoodItem[] = result.foodItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      nutrition: {
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        fiber: item.fiber,
      },
    }));

    await apiAddMeal({
      type: selectedMealType,
      foodItems,
      totalNutrition: {
        calories: result.totalCalories,
        protein: result.totalProtein,
        carbs: result.totalCarbs,
        fats: result.totalFats,
        fiber: result.totalFiber,
      },
      imageUrl: selectedImage || undefined,
      timestamp: new Date().toISOString(),
      date: getToday(),
    });

    setStep("confirm");

    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  const handleReset = () => {
    setStep("upload");
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  const updateFoodItem = (index: number, field: string, value: number) => {
    if (!result) return;
    const updated = { ...result };
    const item = { ...updated.foodItems[index], [field]: value };
    updated.foodItems[index] = item;
    // Recalculate totals
    updated.totalCalories = updated.foodItems.reduce((s, i) => s + i.calories, 0);
    updated.totalProtein = updated.foodItems.reduce((s, i) => s + i.protein, 0);
    updated.totalCarbs = updated.foodItems.reduce((s, i) => s + i.carbs, 0);
    updated.totalFats = updated.foodItems.reduce((s, i) => s + i.fats, 0);
    updated.totalFiber = updated.foodItems.reduce((s, i) => s + i.fiber, 0);
    setResult(updated);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scan Your Meal</h1>
          <p className="text-sm text-muted-foreground">
            Upload a photo and let AI analyze the nutrition
          </p>
        </div>
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="space-y-4">
          {/* Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "upload-zone rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer min-h-[300px] transition-all",
              isDragging && "drag-over",
              selectedImage && "border-primary"
            )}
          >
            {selectedImage ? (
              <div className="relative w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Selected meal"
                  className="w-full max-h-[400px] object-contain rounded-xl"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Camera className="w-9 h-9 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-1">
                  Drop your meal photo here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse • JPEG, PNG, WebP up to 10MB
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Supports drag & drop</span>
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="hidden"
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {selectedImage && (
            <button
              onClick={handleAnalyze}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-light text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              ✨ Analyze with AI
            </button>
          )}
        </div>
      )}

      {/* Step: Analyzing */}
      {step === "analyzing" && (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse-glow">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Analyzing Your Meal...
          </h2>
          <p className="text-sm text-muted-foreground">
            Our AI is identifying food items and estimating nutrition
          </p>
        </div>
      )}

      {/* Step: Results */}
      {step === "results" && result && (
        <div className="space-y-4">
          {/* Description */}
          <div className="glass-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-1">AI Analysis</p>
            <p className="text-foreground font-medium">
              {result.mealDescription}
            </p>
          </div>

          {/* Totals */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Total Nutrition
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: "Calories", value: result.totalCalories, unit: "kcal", cls: "macro-calories" },
                { label: "Protein", value: result.totalProtein, unit: "g", cls: "macro-protein" },
                { label: "Carbs", value: result.totalCarbs, unit: "g", cls: "macro-carbs" },
                { label: "Fats", value: result.totalFats, unit: "g", cls: "macro-fats" },
                { label: "Fiber", value: result.totalFiber, unit: "g", cls: "macro-fiber" },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <p className={`text-lg font-bold tabular-nums ${m.cls}`}>
                    {Math.round(m.value)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Food Items */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Detected Items
            </h3>
            <div className="space-y-3">
              {result.foodItems.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-card/50 border border-border/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {item.quantity}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setEditingIndex(editingIndex === i ? null : i)
                      }
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Edit item"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {editingIndex === i ? (
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {(["calories", "protein", "carbs", "fats", "fiber"] as const).map(
                        (field) => (
                          <div key={field}>
                            <label className="text-[10px] text-muted-foreground uppercase block mb-1">
                              {field}
                            </label>
                            <input
                              type="number"
                              value={item[field]}
                              onChange={(e) =>
                                updateFoodItem(
                                  i,
                                  field,
                                  Number(e.target.value) || 0
                                )
                              }
                              className="w-full px-2 py-1.5 text-xs rounded-lg bg-muted border border-border text-foreground tabular-nums"
                            />
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>
                        <strong className="macro-calories">{item.calories}</strong>{" "}
                        kcal
                      </span>
                      <span>
                        P:<strong className="macro-protein">{item.protein}</strong>g
                      </span>
                      <span>
                        C:<strong className="macro-carbs">{item.carbs}</strong>g
                      </span>
                      <span>
                        F:<strong className="macro-fats">{item.fats}</strong>g
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Meal Type Selector */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Meal Type
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(MEAL_TYPE_CONFIG) as MealType[]).map((type) => {
                const config = MEAL_TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center",
                      selectedMealType === type
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card/50 text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <span className="text-xl">{config.icon}</span>
                    <span className="text-xs font-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Retake Photo
            </button>
            <button
              onClick={handleSaveMeal}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              Save Meal ✓
            </button>
          </div>
        </div>
      )}

      {/* Step: Confirm */}
      {step === "confirm" && (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Meal Saved! 🎉
          </h2>
          <p className="text-sm text-muted-foreground">
            Redirecting to dashboard...
          </p>
        </div>
      )}
    </div>
  );
}

function getDefaultMealType(): MealType {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 15) return "lunch";
  if (hour >= 15 && hour < 18) return "snack";
  return "dinner";
}
