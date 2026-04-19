import { NextRequest, NextResponse } from "next/server";
import { extractToken, getCurrentUserFromToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = extractToken(request);
  const user = await getCurrentUserFromToken(token);

  return NextResponse.json({
    authenticated: Boolean(user),
    user
  });
}
