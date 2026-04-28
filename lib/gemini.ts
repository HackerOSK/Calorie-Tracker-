import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function analyzeMealImage(
  base64Image: string,
  mimeType: string,
  userDescription?: string
): Promise<{
  foodItems: Array<{
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  mealDescription: string;
}> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const userHint = userDescription
    ? `\n\nThe user has described this meal as: "${userDescription}". Use this description along with the image to identify food items more accurately and estimate portions.`
    : "";

  const prompt = `You are a professional nutritionist AI. Analyze the food in this image and provide detailed nutritional estimates.${userHint}

IMPORTANT: Respond ONLY with a valid JSON object (no markdown, no code fences, no extra text).

Identify each food item visible in the image and estimate its nutritional content. If this is Indian food, use Indian nutritional databases for accuracy.

Return this exact JSON structure:
{
  "foodItems": [
    {
      "name": "Food item name",
      "quantity": "estimated portion (e.g., '1 bowl', '2 pieces', '150g')",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fats": 0,
      "fiber": 0
    }
  ],
  "totalCalories": 0,
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFats": 0,
  "totalFiber": 0,
  "mealDescription": "A brief description of the meal"
}

All numerical values should be in whole numbers. Calories in kcal, protein/carbs/fats/fiber in grams.
Be as accurate as possible with portion sizes based on what you see in the image.`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    },
    { text: prompt },
  ]);

  const response = result.response;
  const text = response.text();

  // Clean up the response - remove any markdown formatting
  const cleanedText = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    return JSON.parse(cleanedText);
  } catch {
    throw new Error("Failed to parse AI response. Please try again.");
  }
}
