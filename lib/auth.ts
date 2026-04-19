import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectToDatabase } from "./mongodb";
import User from "./models/user";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "caltracker-secret-key-change-in-production"
);

const TOKEN_NAME = "caltracker_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  [key: string]: unknown;
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_MAX_AGE}s`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_NAME)?.value;
}

export async function getCurrentUser(): Promise<{
  userId: string;
  email: string;
  name: string;
} | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  await connectToDatabase();
  const user = await User.findById(payload.userId).select("email name").lean();
  if (!user) return null;

  return {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
  };
}

/**
 * Extract userId from the auth cookie. Use in API routes.
 * Returns null if not authenticated.
 */
export async function getAuthUserId(): Promise<string | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}
