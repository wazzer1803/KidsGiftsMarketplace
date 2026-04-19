import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "OTP login is disabled. Use email and password login."
    },
    { status: 410 }
  );
}
