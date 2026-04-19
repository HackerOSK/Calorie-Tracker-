import { NextRequest, NextResponse } from "next/server";
import { analyzeMealImage } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPEG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Analyze with Gemini
    const result = await analyzeMealImage(base64, file.type);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Meal analysis error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to analyze meal";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
