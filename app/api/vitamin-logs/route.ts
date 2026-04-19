import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { VitaminLogModel } from "@/lib/models/vitamin";
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

  const logs = await VitaminLogModel.find({ userId, date }).lean();
  const mapped = logs.map((l) => ({
    vitaminId: l.vitaminId.toString(),
    date: l.date,
    taken: l.taken,
  }));

  return NextResponse.json({ logs: mapped });
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();

  const { vitaminId, date } = await request.json();

  if (!vitaminId || !date) {
    return NextResponse.json(
      { error: "vitaminId and date are required" },
      { status: 400 }
    );
  }

  // Toggle: find existing log or create new one
  const existing = await VitaminLogModel.findOne({ userId, vitaminId, date });

  if (existing) {
    existing.taken = !existing.taken;
    existing.timestamp = new Date().toISOString();
    await existing.save();
    return NextResponse.json({
      log: {
        vitaminId: existing.vitaminId.toString(),
        date: existing.date,
        taken: existing.taken,
      },
    });
  }

  const log = await VitaminLogModel.create({
    userId,
    vitaminId,
    date,
    taken: true,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(
    {
      log: {
        vitaminId: log.vitaminId.toString(),
        date: log.date,
        taken: log.taken,
      },
    },
    { status: 201 }
  );
}
