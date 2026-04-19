import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import GoalModel from "@/lib/models/goal";
import { getAuthUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();

  let goal = await GoalModel.findOne({ userId }).lean();

  // Create default goals if none exist
  if (!goal) {
    const created = await GoalModel.create({
      userId,
      calories: 2000,
      protein: 60,
      carbs: 250,
      fats: 65,
      fiber: 25,
      water: 3000,
    });

    return NextResponse.json({
      calories: created.calories,
      protein: created.protein,
      carbs: created.carbs,
      fats: created.fats,
      fiber: created.fiber,
      water: created.water,
    });
  }

  return NextResponse.json({
    calories: goal.calories,
    protein: goal.protein,
    carbs: goal.carbs,
    fats: goal.fats,
    fiber: goal.fiber,
    water: goal.water,
  });
}

export async function PUT(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();

  const body = await request.json();
  const { calories, protein, carbs, fats, fiber, water } = body;

  const goal = await GoalModel.findOneAndUpdate(
    { userId },
    { calories, protein, carbs, fats, fiber, water },
    { upsert: true, new: true, lean: true }
  );

  if (!goal) {
    return NextResponse.json({ error: "Failed to update goals" }, { status: 500 });
  }

  return NextResponse.json({
    calories: goal.calories,
    protein: goal.protein,
    carbs: goal.carbs,
    fats: goal.fats,
    fiber: goal.fiber,
    water: goal.water,
  });
}
