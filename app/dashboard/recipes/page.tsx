"use client";

import { useState, useMemo } from "react";
import { INDIAN_RECIPES } from "@/data/indian-recipes";
import type { Recipe, RecipeCategory } from "@/types/recipe";
import {
  ChefHat,
  Search,
  Clock,
  Flame,
  Users,
  ArrowLeft,
  X,
  Filter,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CATEGORIES: (RecipeCategory | "All")[] = [
  "All",
  "Dal & Lentils",
  "Curry & Sabzi",
  "Rice & Biryani",
  "Roti & Bread",
  "Snacks & Chaat",
  "Eggs & Protein",
  "Salad & Raita",
  "Smoothie & Drink",
  "Soup",
];

export default function RecipesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<RecipeCategory | "All">("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return INDIAN_RECIPES.filter((r) => {
      if (category !== "All" && r.category !== category) return false;
      if (vegOnly && !r.isVegetarian) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.includes(q)) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, category, vegOnly]);

  // Recipe Detail View
  if (selectedRecipe) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
        <button
          onClick={() => setSelectedRecipe(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to recipes
        </button>

        {/* Header */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{selectedRecipe.imageEmoji}</span>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {selectedRecipe.name}
              </h1>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedRecipe.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-foreground">
                  <Clock className="w-3 h-3" />
                  {selectedRecipe.prepTime + selectedRecipe.cookTime} min
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-foreground">
                  <Users className="w-3 h-3" />
                  {selectedRecipe.servings} servings
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-foreground">
                  {selectedRecipe.difficulty}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {selectedRecipe.cuisine}
                </span>
                {selectedRecipe.isVegetarian && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <Leaf className="w-3 h-3" /> Veg
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition per serving */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Nutrition per Serving
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Calories", value: selectedRecipe.nutrition.calories, unit: "kcal", cls: "macro-calories" },
              { label: "Protein", value: selectedRecipe.nutrition.protein, unit: "g", cls: "macro-protein" },
              { label: "Carbs", value: selectedRecipe.nutrition.carbs, unit: "g", cls: "macro-carbs" },
              { label: "Fats", value: selectedRecipe.nutrition.fats, unit: "g", cls: "macro-fats" },
              { label: "Fiber", value: selectedRecipe.nutrition.fiber, unit: "g", cls: "macro-fiber" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className={`text-lg font-bold tabular-nums ${m.cls}`}>
                  {m.value}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Ingredients
          </h3>
          <ul className="space-y-2">
            {selectedRecipe.ingredients.map((ing, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-sm text-foreground"
              >
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span>
                  {ing.quantity} {ing.unit} {ing.name}
                </span>
                {ing.isOptional && (
                  <span className="text-xs text-muted-foreground italic">
                    (optional)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Instructions
          </h3>
          <ol className="space-y-4">
            {selectedRecipe.instructions.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground leading-relaxed pt-0.5">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {selectedRecipe.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-card border border-border text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <ChefHat className="w-7 h-7 text-primary" />
          Indian Recipes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {filtered.length} recipes • Quick, healthy, and delicious
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search recipes, ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
            showFilters
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border text-foreground hover:bg-muted"
          )}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          {/* Categories */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Veg filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                vegOnly
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-card border border-border text-muted-foreground"
              )}
            >
              <Leaf className="w-3 h-3" />
              Vegetarian Only
            </button>
            {(category !== "All" || vegOnly || search) && (
              <button
                onClick={() => {
                  setCategory("All");
                  setVegOnly(false);
                  setSearch("");
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground bg-muted transition-colors"
              >
                <X className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recipe Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No recipes match your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className="glass-card rounded-2xl p-5 text-left hover:shadow-lg hover:shadow-glow transition-all duration-300 group glow-card"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{recipe.imageEmoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {recipe.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {recipe.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                  <Clock className="w-2.5 h-2.5" />
                  {recipe.prepTime + recipe.cookTime}m
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                  {recipe.difficulty}
                </span>
                {recipe.isVegetarian && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    <Leaf className="w-2.5 h-2.5" /> Veg
                  </span>
                )}
              </div>

              <div className="flex justify-between text-xs">
                <span className="tabular-nums">
                  <strong className="macro-calories">
                    {recipe.nutrition.calories}
                  </strong>{" "}
                  kcal
                </span>
                <span className="tabular-nums">
                  P:<strong className="macro-protein">{recipe.nutrition.protein}</strong>g
                </span>
                <span className="tabular-nums">
                  C:<strong className="macro-carbs">{recipe.nutrition.carbs}</strong>g
                </span>
                <span className="tabular-nums">
                  F:<strong className="macro-fats">{recipe.nutrition.fats}</strong>g
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
