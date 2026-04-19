import { connectDB } from "@/lib/db";
import SiteSettingModel from "@/lib/models/SiteSetting";
import WhatsAppOrderConfigModel from "@/lib/models/WhatsAppOrderConfig";
import { normalizePhoneForWhatsapp } from "@/lib/utils";

export type WhatsAppOrderSettings = {
  whatsappNumbers: string[];
  activeWhatsappNumber: string;
};

const DEFAULT_WHATSAPP_NUMBER = normalizePhoneForWhatsapp(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "");

function normalizeWhatsappNumbers(input?: unknown) {
  const rawList = Array.isArray(input) ? input : [];
  const normalized = rawList
    .map((entry) => normalizePhoneForWhatsapp(String(entry || "")))
    .filter(Boolean);

  return Array.from(new Set(normalized));
}

function normalizeWhatsAppOrderSettings(value?: Partial<WhatsAppOrderSettings>): WhatsAppOrderSettings {
  const numbers = normalizeWhatsappNumbers(value?.whatsappNumbers);
  const whatsappNumbers = numbers.length ? numbers : DEFAULT_WHATSAPP_NUMBER ? [DEFAULT_WHATSAPP_NUMBER] : [];
  const activeCandidate = normalizePhoneForWhatsapp(value?.activeWhatsappNumber || "");
  const activeWhatsappNumber = activeCandidate && whatsappNumbers.includes(activeCandidate)
    ? activeCandidate
    : whatsappNumbers[0] || "";

  return {
    whatsappNumbers,
    activeWhatsappNumber
  };
}

async function readLegacyWhatsAppSettings() {
  const legacy = await SiteSettingModel.findOne({ key: "display" }).lean();
  if (!legacy) {
    return null;
  }

  return normalizeWhatsAppOrderSettings({
    whatsappNumbers: (legacy as any).whatsappNumbers,
    activeWhatsappNumber: (legacy as any).activeWhatsappNumber
  });
}

export async function getWhatsAppOrderSettings() {
  await connectDB();

  const current = await WhatsAppOrderConfigModel.findOne({ key: "order" }).lean();
  if (!current) {
    const legacy = await readLegacyWhatsAppSettings();
    const initial = normalizeWhatsAppOrderSettings(legacy || undefined);
    await WhatsAppOrderConfigModel.create({
      key: "order",
      numbers: initial.whatsappNumbers,
      activeNumber: initial.activeWhatsappNumber
    });

    return initial;
  }

  return normalizeWhatsAppOrderSettings({
    whatsappNumbers: (current as any).numbers,
    activeWhatsappNumber: (current as any).activeNumber
  });
}

export async function updateWhatsAppOrderSettings(update: Partial<WhatsAppOrderSettings>) {
  await connectDB();

  const current = await getWhatsAppOrderSettings();
  const merged = normalizeWhatsAppOrderSettings({
    whatsappNumbers: Array.isArray(update.whatsappNumbers) ? update.whatsappNumbers : current.whatsappNumbers,
    activeWhatsappNumber:
      typeof update.activeWhatsappNumber === "string" ? update.activeWhatsappNumber : current.activeWhatsappNumber
  });

  const saved = await WhatsAppOrderConfigModel.findOneAndUpdate(
    { key: "order" },
    {
      $set: {
        numbers: merged.whatsappNumbers,
        activeNumber: merged.activeWhatsappNumber
      },
      $setOnInsert: {
        key: "order"
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  ).lean();

  return normalizeWhatsAppOrderSettings({
    whatsappNumbers: (saved as any).numbers,
    activeWhatsappNumber: (saved as any).activeNumber
  });
}

