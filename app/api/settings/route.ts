import { NextResponse } from "next/server";
import { getDisplaySettings } from "@/lib/site-settings";

export async function GET() {
  try {
    const settings = await getDisplaySettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}
