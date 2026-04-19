import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User";
import { normalizePhoneForWhatsapp } from "@/lib/utils";

export const AUTH_COOKIE_NAME = "km_session";

type AuthPayload = {
  userId: string;
  role: "user" | "admin";
  phone: string;
};

function getJwtSecret() {
  return process.env.JWT_SECRET || "replace-this-secret-in-production";
}

function getNormalizedPhoneCandidates(phone: string) {
  const digits = normalizePhoneForWhatsapp(phone);
  if (!digits) return [];
  const last10 = digits.length > 10 ? digits.slice(-10) : digits;
  return Array.from(new Set([digits, last10]));
}

export function getAdminPhoneAllowlist() {
  const rawList = [process.env.ADMIN_PHONE || "", process.env.ADMIN_PHONES || ""]
    .join(",")
    .split(",")
    .map((item) => normalizePhoneForWhatsapp(item))
    .filter(Boolean);

  return Array.from(new Set(rawList));
}

export function isPhoneInAdminAllowlist(phone: string) {
  const allowlist = getAdminPhoneAllowlist();
  if (!allowlist.length) {
    return false;
  }

  const candidates = getNormalizedPhoneCandidates(phone);
  if (!candidates.length) {
    return false;
  }

  return allowlist.some((adminPhone) => {
    const adminCandidates = getNormalizedPhoneCandidates(adminPhone);
    return candidates.some((candidate) => adminCandidates.some((admin) => candidate === admin));
  });
}

export function signAuthToken(payload: AuthPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d"
  });
}

export function verifyAuthToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthPayload;
  } catch {
    return null;
  }
}

export function extractToken(req: NextRequest) {
  return req.cookies.get(AUTH_COOKIE_NAME)?.value;
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/"
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

export async function getCurrentUserFromToken(token?: string) {
  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return null;
  }

  await connectDB();
  const user = await UserModel.findById(payload.userId).exec();

  if (!user) {
    return null;
  }

  const shouldBeAdmin = isPhoneInAdminAllowlist(user.phone);
  const expectedRole = shouldBeAdmin ? "admin" : "user";

  if (user.role !== expectedRole) {
    user.role = expectedRole;
    await user.save();
  }

  return {
    id: user._id.toString(),
    phone: user.phone,
    name: user.name,
    email: user.email,
    city: user.city,
    avatarUrl: user.avatarUrl,
    role: user.role
  };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return getCurrentUserFromToken(token);
}

export async function requireAdminUser() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}
