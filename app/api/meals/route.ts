import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import MealModel from "@/lib/models/meal";
import { getAuthUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  const query: Record<string, string> = { userId };
  if (date) query.date = date;

  const meals = await MealModel.find(query)
    .sort({ timestamp: -1 })
    .lean();

  // Map _id to id for frontend compatibility
  const mapped = meals.map((m) => ({
    id: m._id.toString(),
    type: m.type,
    foodItems: m.foodItems,
    totalNutrition: m.totalNutrition,
    imageUrl: m.imageUrl,
    notes: m.notes,
    timestamp: m.timestamp,
    date: m.date,
  }));

  return NextResponse.json({ meals: mapped });
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();

  const body = await request.json();
  const meal = await MealModel.create({ ...body, userId });

  return NextResponse.json(
    {
      meal: {
        id: meal._id.toString(),
        type: meal.type,
        foodItems: meal.foodItems,
        totalNutrition: meal.totalNutrition,
        imageUrl: meal.imageUrl,
        notes: meal.notes,
        timestamp: meal.timestamp,
        date: meal.date,
      },
    },
    { status: 201 }
  );
}

export async function DELETE(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Meal ID required" }, { status: 400 });
  }

  // Ensure user can only delete their own meals
  const result = await MealModel.deleteOne({ _id: id, userId });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Meal not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
