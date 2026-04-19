import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import WaterIntakeModel from "@/lib/models/water";
import { getAuthUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const record = await WaterIntakeModel.findOne({ userId, date }).lean();
  return NextResponse.json({ amount: record?.amount ?? 0 });
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();

  const { date, amount } = await request.json();

  if (!date || amount === undefined) {
    return NextResponse.json(
      { error: "Date and amount are required" },
      { status: 400 }
    );
  }

  const record = await WaterIntakeModel.findOneAndUpdate(
    { userId, date },
    { $inc: { amount } },
    { upsert: true, new: true, lean: true }
  );

  return NextResponse.json({ amount: record?.amount ?? 0 });
}
