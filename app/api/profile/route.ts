import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { extractToken, getCurrentUserFromToken } from "@/lib/auth";
import UserModel from "@/lib/models/User";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function PATCH(request: NextRequest) {
  try {
    const token = extractToken(request);
    const authUser = await getCurrentUserFromToken(token);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");
    const wantsPasswordChange = Boolean(currentPassword || newPassword || confirmPassword);

    if (wantsPasswordChange) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Enter your current password." }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "New password and confirm password do not match." }, { status: 400 });
      }
    }

    await connectDB();
    const user = await UserModel.findById(authUser.id).exec();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.name = String(body.name || "").trim().slice(0, 60);
    user.city = String(body.city || "").trim().slice(0, 80);
    user.avatarUrl = String(body.avatarUrl || "").trim().slice(0, 400);

    if (wantsPasswordChange) {
      if (!user.passwordHash) {
        return NextResponse.json(
          { error: "No existing local password found for this account." },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = verifyPassword(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }

      user.passwordHash = hashPassword(newPassword);
    }

    await user.save();

    return NextResponse.json({
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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
