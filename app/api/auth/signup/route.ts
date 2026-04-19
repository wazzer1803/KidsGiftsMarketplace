import { NextRequest, NextResponse } from "next/server";
import { isPhoneInAdminAllowlist, setAuthCookie, signAuthToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User";
import { hashPassword } from "@/lib/password";
import { isValidEmailFormat, sanitizeEmail, sanitizePhone } from "@/lib/utils";

function isValidPhone(phone: string) {
  return /^\+?[0-9]{10,15}$/.test(phone);
}

function isValidPassword(password: string) {
  return String(password || "").length >= 6;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = sanitizePhone(body.phone || "");
    const email = sanitizeEmail(body.email || "");
    const password = String(body.password || "");

    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    }

    if (!isValidEmailFormat(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!isValidPassword(password)) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    await connectDB();

    const existingPhone = await UserModel.findOne({ phone }).lean();
    if (existingPhone) {
      return NextResponse.json(
        { error: "Phone number is already linked with another account." },
        { status: 400 }
      );
    }

    const existingEmail = await UserModel.findOne({ email }).lean();
    if (existingEmail) {
      return NextResponse.json({ error: "Email already exists. Please login." }, { status: 400 });
    }

    const isAdmin = isPhoneInAdminAllowlist(phone);
    const passwordHash = hashPassword(password);

    const user = await UserModel.create({
      phone,
      email,
      passwordHash,
      role: isAdmin ? "admin" : "user"
    });

    const token = signAuthToken({
      userId: user._id.toString(),
      phone: user.phone,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.name,
        email: user.email,
        city: user.city,
        avatarUrl: user.avatarUrl,
        role: user.role
      }
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Signup failed.";
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}
