/**
 * Client-side API helper for making authenticated requests.
 * Cookies are sent automatically by the browser.
 */

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return { error: `Unexpected response (${res.status}). Server returned non-JSON.` };
    }

    const json = await res.json();

    if (!res.ok) {
      return { error: json.error || `Request failed (${res.status})` };
    }

    return { data: json };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string) {
  return apiRequest<{ user: { id: string; email: string; name: string } }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
}

export async function apiSignup(
  name: string,
  email: string,
  password: string
) {
  return apiRequest<{ user: { id: string; email: string; name: string } }>(
    "/api/auth/signup",
    {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }
  );
}

export async function apiLogout() {
  return apiRequest("/api/auth/logout", { method: "POST" });
}

export async function apiGetMe() {
  return apiRequest<{ userId: string; email: string; name: string }>(
    "/api/auth/me"
  );
}

// ─── Meals ───────────────────────────────────────────────────────────────────

export interface MealPayload {
  type: string;
  foodItems: Array<{
    name: string;
    quantity: string;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      fiber: number;
    };
  }>;
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  imageUrl?: string;
  notes?: string;
  timestamp: string;
  date: string;
}

export async function apiGetMeals(date?: string) {
  const url = date ? `/api/meals?date=${date}` : "/api/meals";
  return apiRequest<{ meals: MealPayload[] }>(url);
}

export async function apiAddMeal(meal: MealPayload) {
  return apiRequest<{ meal: MealPayload }>("/api/meals", {
    method: "POST",
    body: JSON.stringify(meal),
  });
}

export async function apiDeleteMeal(id: string) {
  return apiRequest(`/api/meals?id=${id}`, { method: "DELETE" });
}

export async function apiUpdateMeal(id: string, meal: Partial<MealPayload>) {
  return apiRequest<{ meal: MealPayload }>("/api/meals", {
    method: "PUT",
    body: JSON.stringify({ id, ...meal }),
  });
}

export async function apiGetDayMeals(date: string) {
  return apiRequest<{ meals: (MealPayload & { id: string })[] }>(
    `/api/meals?date=${date}`
  );
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export interface GoalsPayload {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  water: number;
}

export async function apiGetGoals() {
  return apiRequest<GoalsPayload>("/api/goals");
}

export async function apiSetGoals(goals: GoalsPayload) {
  return apiRequest<GoalsPayload>("/api/goals", {
    method: "PUT",
    body: JSON.stringify(goals),
  });
}

// ─── Water ───────────────────────────────────────────────────────────────────

export async function apiGetWater(date: string) {
  return apiRequest<{ amount: number }>(`/api/water?date=${date}`);
}

export async function apiAddWater(date: string, amount: number) {
  return apiRequest<{ amount: number }>("/api/water", {
    method: "POST",
    body: JSON.stringify({ date, amount }),
  });
}

// ─── Vitamins ────────────────────────────────────────────────────────────────

export async function apiGetVitamins() {
  return apiRequest<{ vitamins: Array<{ _id: string; id: string; name: string; dosage: string; frequency: string; timeOfDay: string; notes?: string; color: string; icon: string }> }>(
    "/api/vitamins"
  );
}

export async function apiAddVitamin(vitamin: {
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string;
  notes?: string;
  color: string;
  icon: string;
}) {
  return apiRequest("/api/vitamins", {
    method: "POST",
    body: JSON.stringify(vitamin),
  });
}

export async function apiDeleteVitamin(id: string) {
  return apiRequest(`/api/vitamins?id=${id}`, { method: "DELETE" });
}

// ─── Vitamin Logs ────────────────────────────────────────────────────────────

export async function apiGetVitaminLogs(date: string) {
  return apiRequest<{
    logs: Array<{ vitaminId: string; date: string; taken: boolean }>;
  }>(`/api/vitamin-logs?date=${date}`);
}

export async function apiToggleVitaminLog(vitaminId: string, date: string) {
  return apiRequest("/api/vitamin-logs", {
    method: "POST",
    body: JSON.stringify({ vitaminId, date }),
  });
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export interface CalendarDayData {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  mealCount: number;
  calorieGoal: number;
  isOverGoal: boolean;
}

export async function apiGetCalendarData(year: number, month: number) {
  return apiRequest<{ days: CalendarDayData[]; calorieGoal: number }>(
    `/api/calendar?year=${year}&month=${month}`
  );
}
