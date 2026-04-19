import { NextRequest, NextResponse } from "next/server";
import { extractToken, getCurrentUserFromToken } from "@/lib/auth";
import { getDisplaySettings, updateDisplaySettings } from "@/lib/site-settings";
import { getWhatsAppOrderSettings, updateWhatsAppOrderSettings } from "@/lib/whatsapp-order-settings";

async function requireAdmin(request: NextRequest) {
  const token = extractToken(request);
  const authUser = await getCurrentUserFromToken(token);
  return authUser && authUser.role === "admin";
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [display, whatsapp] = await Promise.all([getDisplaySettings(), getWhatsAppOrderSettings()]);
    const settings = {
      ...display,
      whatsappNumbers: whatsapp.whatsappNumbers,
      activeWhatsappNumber: whatsapp.activeWhatsappNumber
    };
    return NextResponse.json({ settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load admin settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const [display, whatsapp] = await Promise.all([
      updateDisplaySettings({
        showPrice: typeof body.showPrice === "boolean" ? body.showPrice : undefined,
        showQuantity: typeof body.showQuantity === "boolean" ? body.showQuantity : undefined
      }),
      updateWhatsAppOrderSettings({
        whatsappNumbers: Array.isArray(body.whatsappNumbers) ? body.whatsappNumbers.map(String) : undefined,
        activeWhatsappNumber: typeof body.activeWhatsappNumber === "string" ? body.activeWhatsappNumber : undefined
      })
    ]);

    const settings = {
      ...display,
      whatsappNumbers: whatsapp.whatsappNumbers,
      activeWhatsappNumber: whatsapp.activeWhatsappNumber
    };

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update admin settings" }, { status: 500 });
  }
}
