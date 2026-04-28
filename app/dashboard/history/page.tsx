"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { apiGetMeals, apiDeleteMeal, apiUpdateMeal } from "@/lib/api-client";
import type { MealPayload } from "@/lib/api-client";
import { formatDate, formatTime } from "@/lib/utils";
import type { Meal, MealType, FoodItem } from "@/types/meal";
import { MEAL_TYPE_CONFIG } from "@/types/meal";
import {
  History,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  Pencil,
  X,
  Check,
  Plus,
  Loader2,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditingMeal {
  id: string;
  type: MealType;
  foodItems: FoodItem[];
  totalNutrition: FoodItem["nutrition"];
}

export default function HistoryPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditingMeal | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
  });

  useEffect(() => {
    async function loadMeals() {
      const { data } = await apiGetMeals();
      if (data?.meals) {
        const sorted = (data.meals as unknown as Meal[]).sort((a, b) =>
          b.timestamp.localeCompare(a.timestamp)
        );
        setMeals(sorted);
      }
    }
    loadMeals();
  }, []);

  const handleDelete = async (id: string) => {
    await apiDeleteMeal(id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
    if (editingMealId === id) {
      setEditingMealId(null);
      setEditData(null);
    }
  };

  const startEditing = useCallback((meal: Meal) => {
    setEditingMealId(meal.id);
    setEditData({
      id: meal.id,
      type: meal.type,
      foodItems: meal.foodItems.map((f) => ({
        name: f.name,
        quantity: f.quantity,
        nutrition: { ...f.nutrition },
      })),
      totalNutrition: { ...meal.totalNutrition },
    });
    setShowAddItem(false);
    setNewItem({ name: "", quantity: "", calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });
  }, []);

  const cancelEditing = () => {
    setEditingMealId(null);
    setEditData(null);
    setShowAddItem(false);
  };

  const recalcTotals = (items: FoodItem[]): FoodItem["nutrition"] => ({
    calories: items.reduce((s, i) => s + i.nutrition.calories, 0),
    protein: items.reduce((s, i) => s + i.nutrition.protein, 0),
    carbs: items.reduce((s, i) => s + i.nutrition.carbs, 0),
    fats: items.reduce((s, i) => s + i.nutrition.fats, 0),
    fiber: items.reduce((s, i) => s + i.nutrition.fiber, 0),
  });

  const updateEditField = (index: number, field: keyof FoodItem["nutrition"], value: number) => {
    if (!editData) return;
    const updated = { ...editData };
    const items = [...updated.foodItems];
    items[index] = {
      ...items[index],
      nutrition: { ...items[index].nutrition, [field]: value },
    };
    updated.foodItems = items;
    updated.totalNutrition = recalcTotals(items);
    setEditData(updated);
  };

  const updateEditItemName = (index: number, name: string) => {
    if (!editData) return;
    const items = [...editData.foodItems];
    items[index] = { ...items[index], name };
    setEditData({ ...editData, foodItems: items });
  };

  const updateEditItemQuantity = (index: number, quantity: string) => {
    if (!editData) return;
    const items = [...editData.foodItems];
    items[index] = { ...items[index], quantity };
    setEditData({ ...editData, foodItems: items });
  };

  const removeEditItem = (index: number) => {
    if (!editData) return;
    const items = editData.foodItems.filter((_, i) => i !== index);
    setEditData({ ...editData, foodItems: items, totalNutrition: recalcTotals(items) });
  };

  const addNewItemToEdit = () => {
    if (!editData || !newItem.name.trim()) return;
    const foodItem: FoodItem = {
      name: newItem.name,
      quantity: newItem.quantity || "1 serving",
      nutrition: {
        calories: newItem.calories,
        protein: newItem.protein,
        carbs: newItem.carbs,
        fats: newItem.fats,
        fiber: newItem.fiber,
      },
    };
    const items = [...editData.foodItems, foodItem];
    setEditData({ ...editData, foodItems: items, totalNutrition: recalcTotals(items) });
    setNewItem({ name: "", quantity: "", calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });
    setShowAddItem(false);
  };

  const changeEditMealType = (type: MealType) => {
    if (!editData) return;
    setEditData({ ...editData, type });
  };

  const handleSave = async () => {
    if (!editData || editData.foodItems.length === 0) return;
    setSaving(true);
    const payload: Partial<MealPayload> = {
      type: editData.type,
      foodItems: editData.foodItems.map((f) => ({
        name: f.name,
        quantity: f.quantity,
        nutrition: f.nutrition,
      })),
      totalNutrition: editData.totalNutrition,
    };
    const res = await apiUpdateMeal(editData.id, payload);
    if (res.data?.meal) {
      setMeals((prev) =>
        prev.map((m) =>
          m.id === editData.id
            ? {
                ...m,
                type: editData.type,
                foodItems: editData.foodItems,
                totalNutrition: editData.totalNutrition,
              }
            : m
        )
      );
    }
    setSaving(false);
    setEditingMealId(null);
    setEditData(null);
  };

  // Filter and group by date
  const filteredMeals = useMemo(() => {
    if (!searchQuery) return meals;
    const q = searchQuery.toLowerCase();
    return meals.filter(
      (m) =>
        m.foodItems.some((f) => f.name.toLowerCase().includes(q)) ||
        MEAL_TYPE_CONFIG[m.type].label.toLowerCase().includes(q)
    );
  }, [meals, searchQuery]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Meal[]> = {};
    filteredMeals.forEach((meal) => {
      if (!groups[meal.date]) groups[meal.date] = [];
      groups[meal.date].push(meal);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredMeals]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <History className="w-7 h-7 text-primary" />
          Meal History
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meals.length} meals logged total • Click edit to modify past meals
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search meals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Grouped meals */}
      {groupedByDate.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <History className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? "No meals match your search"
              : "No meals logged yet. Start scanning!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {groupedByDate.map(([date, dateMeals]) => {
            const dailyTotal = dateMeals.reduce(
              (sum, m) => sum + m.totalNutrition.calories,
              0
            );
            const isExpanded =
              expandedDate === date || expandedDate === null;

            return (
              <div
                key={date}
                className="glass-card rounded-2xl overflow-hidden"
              >
                {/* Date header */}
                <button
                  onClick={() =>
                    setExpandedDate(isExpanded && expandedDate !== null ? null : date)
                  }
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {formatDate(date)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {dateMeals.length} meals
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold macro-calories tabular-nums">
                      {Math.round(dailyTotal)} kcal
                    </span>
                    {isExpanded && expandedDate !== null ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Meal items */}
                {isExpanded && (
                  <div className="px-5 pb-4 space-y-2">
                    {dateMeals.map((meal) => {
                      const config = MEAL_TYPE_CONFIG[meal.type];
                      const isEditing = editingMealId === meal.id;

                      if (isEditing && editData) {
                        return (
                          <EditPanel
                            key={meal.id}
                            editData={editData}
                            saving={saving}
                            showAddItem={showAddItem}
                            newItem={newItem}
                            onUpdateField={updateEditField}
                            onUpdateName={updateEditItemName}
                            onUpdateQuantity={updateEditItemQuantity}
                            onRemoveItem={removeEditItem}
                            onChangeType={changeEditMealType}
                            onSetShowAddItem={setShowAddItem}
                            onSetNewItem={setNewItem}
                            onAddNewItem={addNewItemToEdit}
                            onSave={handleSave}
                            onCancel={cancelEditing}
                          />
                        );
                      }

                      return (
                        <div
                          key={meal.id}
                          className="flex items-center gap-4 p-3 rounded-xl bg-card/50 hover:bg-card transition-colors group"
                        >
                          <span className="text-xl flex-shrink-0">
                            {config.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-semibold text-foreground">
                                {config.label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(meal.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {meal.foodItems.map((f) => f.name).join(", ")}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold macro-calories tabular-nums">
                              {Math.round(meal.totalNutrition.calories)} kcal
                            </p>
                            <p className="text-[10px] text-muted-foreground tabular-nums">
                              P:{Math.round(meal.totalNutrition.protein)}g • C:
                              {Math.round(meal.totalNutrition.carbs)}g • F:
                              {Math.round(meal.totalNutrition.fats)}g
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => startEditing(meal)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              aria-label="Edit meal"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(meal.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              aria-label="Delete meal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Edit Panel Component ─────────────────────────────────────────────────── */

interface EditPanelProps {
  editData: EditingMeal;
  saving: boolean;
  showAddItem: boolean;
  newItem: { name: string; quantity: string; calories: number; protein: number; carbs: number; fats: number; fiber: number };
  onUpdateField: (index: number, field: keyof FoodItem["nutrition"], value: number) => void;
  onUpdateName: (index: number, name: string) => void;
  onUpdateQuantity: (index: number, quantity: string) => void;
  onRemoveItem: (index: number) => void;
  onChangeType: (type: MealType) => void;
  onSetShowAddItem: (show: boolean) => void;
  onSetNewItem: (item: EditPanelProps["newItem"]) => void;
  onAddNewItem: () => void;
  onSave: () => void;
  onCancel: () => void;
}

function EditPanel({
  editData,
  saving,
  showAddItem,
  newItem,
  onUpdateField,
  onUpdateName,
  onUpdateQuantity,
  onRemoveItem,
  onChangeType,
  onSetShowAddItem,
  onSetNewItem,
  onAddNewItem,
  onSave,
  onCancel,
}: EditPanelProps) {
  const FIELDS = ["calories", "protein", "carbs", "fats", "fiber"] as const;

  return (
    <div className="p-4 rounded-xl bg-primary/5 border-2 border-primary/20 space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Pencil className="w-4 h-4 text-primary" />
          Editing Meal
        </h4>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Cancel editing"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Meal Type Selector */}
      <div>
        <label className="text-[10px] text-muted-foreground uppercase block mb-2">Meal Type</label>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(MEAL_TYPE_CONFIG) as MealType[]).map((type) => {
            const config = MEAL_TYPE_CONFIG[type];
            return (
              <button
                key={type}
                onClick={() => onChangeType(type)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-center text-xs",
                  editData.type === type
                    ? "border-primary bg-primary/10 text-foreground font-semibold"
                    : "border-border bg-card/50 text-muted-foreground hover:border-primary/50"
                )}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Food Items */}
      <div className="space-y-3">
        <label className="text-[10px] text-muted-foreground uppercase block">
          Food Items ({editData.foodItems.length})
        </label>
        {editData.foodItems.map((item, i) => (
          <div key={i} className="p-3 rounded-lg bg-card/80 border border-border/50 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => onUpdateName(i, e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Item name"
              />
              <input
                type="text"
                value={item.quantity}
                onChange={(e) => onUpdateQuantity(i, e.target.value)}
                className="w-28 px-2 py-1.5 text-sm rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Qty"
              />
              <button
                onClick={() => onRemoveItem(i)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                aria-label="Remove item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {FIELDS.map((field) => (
                <div key={field}>
                  <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">{field}</label>
                  <input
                    type="number"
                    value={item.nutrition[field]}
                    onChange={(e) => onUpdateField(i, field, Number(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-xs rounded-lg bg-muted border border-border text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Add New Item */}
        {!showAddItem ? (
          <button
            onClick={() => onSetShowAddItem(true)}
            className="w-full py-2.5 rounded-lg border-2 border-dashed border-primary/30 text-primary text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-primary/5 hover:border-primary/50 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </button>
        ) : (
          <div className="p-3 rounded-lg bg-card/80 border border-primary/30 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-foreground">New Item</span>
              <button
                onClick={() => onSetShowAddItem(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Item name *"
                value={newItem.name}
                onChange={(e) => onSetNewItem({ ...newItem, name: e.target.value })}
                className="px-2 py-1.5 text-sm rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="text"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) => onSetNewItem({ ...newItem, quantity: e.target.value })}
                className="px-2 py-1.5 text-sm rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {FIELDS.map((field) => (
                <div key={field}>
                  <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">{field}</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem[field] || ""}
                    onChange={(e) => onSetNewItem({ ...newItem, [field]: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-2 py-1 text-xs rounded-lg bg-muted border border-border text-foreground tabular-nums placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={onAddNewItem}
              disabled={!newItem.name.trim()}
              className="w-full py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5 inline mr-1" />
              Add
            </button>
          </div>
        )}
      </div>

      {/* Totals Preview */}
      <div className="grid grid-cols-5 gap-2 p-3 rounded-lg bg-card/50 border border-border/50">
        {[
          { label: "Cal", value: editData.totalNutrition.calories, cls: "macro-calories" },
          { label: "Protein", value: editData.totalNutrition.protein, cls: "macro-protein" },
          { label: "Carbs", value: editData.totalNutrition.carbs, cls: "macro-carbs" },
          { label: "Fats", value: editData.totalNutrition.fats, cls: "macro-fats" },
          { label: "Fiber", value: editData.totalNutrition.fiber, cls: "macro-fiber" },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <p className={`text-sm font-bold tabular-nums ${m.cls}`}>{Math.round(m.value)}</p>
            <p className="text-[9px] text-muted-foreground uppercase">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving || editData.foodItems.length === 0}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-light text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
