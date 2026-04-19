import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import VitaminModel from "@/lib/models/vitamin";
import { getAuthUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();

  const vitamins = await VitaminModel.find({ userId }).lean();
  const mapped = vitamins.map((v) => ({
    _id: v._id.toString(),
    id: v._id.toString(),
    name: v.name,
    dosage: v.dosage,
    frequency: v.frequency,
    timeOfDay: v.timeOfDay,
    notes: v.notes,
    color: v.color,
    icon: v.icon,
  }));

  return NextResponse.json({ vitamins: mapped });
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();

  const body = await request.json();
  const vitamin = await VitaminModel.create({ ...body, userId });

  return NextResponse.json(
    {
      vitamin: {
        _id: vitamin._id.toString(),
        id: vitamin._id.toString(),
        name: vitamin.name,
        dosage: vitamin.dosage,
        frequency: vitamin.frequency,
        timeOfDay: vitamin.timeOfDay,
        notes: vitamin.notes,
        color: vitamin.color,
        icon: vitamin.icon,
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
    return NextResponse.json(
      { error: "Vitamin ID required" },
      { status: 400 }
    );
  }

  const result = await VitaminModel.deleteOne({ _id: id, userId });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Vitamin not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
