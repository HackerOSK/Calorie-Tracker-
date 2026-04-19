import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import MealModel from "@/lib/models/meal";
import GoalModel from "@/lib/models/goal";
import { getAuthUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || "");
  const month = parseInt(searchParams.get("month") || ""); // 0-indexed

  if (isNaN(year) || isNaN(month)) {
    return NextResponse.json(
      { error: "Year and month are required" },
      { status: 400 }
    );
  }

  // Get the goal for this user
  const goal = await GoalModel.findOne({ userId }).lean();
  const calorieGoal = goal?.calories ?? 2000;

  // Build date range for the month
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // last day of month

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  // Aggregate meals by date for this user
  const objectUserId = new mongoose.Types.ObjectId(userId);

  const results = await MealModel.aggregate([
    {
      $match: {
        userId: objectUserId,
        date: { $gte: startStr, $lte: endStr },
      },
    },
    {
      $group: {
        _id: "$date",
        totalCalories: { $sum: "$totalNutrition.calories" },
        totalProtein: { $sum: "$totalNutrition.protein" },
        totalCarbs: { $sum: "$totalNutrition.carbs" },
        totalFats: { $sum: "$totalNutrition.fats" },
        totalFiber: { $sum: "$totalNutrition.fiber" },
        mealCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const days = results.map((r) => ({
    date: r._id,
    totalCalories: Math.round(r.totalCalories),
    totalProtein: Math.round(r.totalProtein),
    totalCarbs: Math.round(r.totalCarbs),
    totalFats: Math.round(r.totalFats),
    totalFiber: Math.round(r.totalFiber),
    mealCount: r.mealCount,
    calorieGoal,
    isOverGoal: r.totalCalories > calorieGoal,
  }));

  return NextResponse.json({ days, calorieGoal });
}
