import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Google sign-in is currently disabled. Use email and password login."
    },
    { status: 410 }
  );
}
