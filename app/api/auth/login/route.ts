import { NextRequest, NextResponse } from "next/server";
import { isPhoneInAdminAllowlist, setAuthCookie, signAuthToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User";
import { verifyPassword } from "@/lib/password";
import { isValidEmailFormat, sanitizeEmail } from "@/lib/utils";

function isValidPassword(password: string) {
  return String(password || "").length >= 6;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = sanitizeEmail(body.email || "");
    const password = String(body.password || "");

    if (!isValidEmailFormat(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!isValidPassword(password)) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    await connectDB();

    const user = await UserModel.findOne({ email }).exec();
    if (!user) {
      return NextResponse.json(
        { error: "No account found for this email. Please sign up first." },
        { status: 404 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account has no local password yet. Please sign up again to create one." },
        { status: 400 }
      );
    }

    const isPasswordValid = verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 400 });
    }

    const expectedRole = isPhoneInAdminAllowlist(user.phone) ? "admin" : "user";
    if (user.role !== expectedRole) {
      user.role = expectedRole;
      await user.save();
    }

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
    const message = error instanceof Error ? error.message : "Login failed.";
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}
