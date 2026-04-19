import { connectDB } from "@/lib/db";
import SiteSettingModel from "@/lib/models/SiteSetting";

export type DisplaySettings = {
  showPrice: boolean;
  showQuantity: boolean;
};

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  showPrice: true,
  showQuantity: true
};

function normalizeDisplaySettings(value?: Partial<DisplaySettings>): DisplaySettings {
  return {
    showPrice: value?.showPrice !== false,
    showQuantity: value?.showQuantity !== false
  };
}

export async function getDisplaySettings() {
  await connectDB();

  const current = await SiteSettingModel.findOne({ key: "display" }).lean();
  if (!current) {
    await SiteSettingModel.create({
      key: "display",
      ...DEFAULT_DISPLAY_SETTINGS
    });
    return DEFAULT_DISPLAY_SETTINGS;
  }

  return normalizeDisplaySettings({
    showPrice: current.showPrice,
    showQuantity: current.showQuantity
  });
}

export async function updateDisplaySettings(update: Partial<DisplaySettings>) {
  await connectDB();

  const payload: Partial<DisplaySettings> = {};
  if (typeof update.showPrice === "boolean") payload.showPrice = update.showPrice;
  if (typeof update.showQuantity === "boolean") payload.showQuantity = update.showQuantity;

  if (!Object.keys(payload).length) {
    return getDisplaySettings();
  }

  const saved = await SiteSettingModel.findOneAndUpdate(
    { key: "display" },
    {
      $set: payload,
      $setOnInsert: {
        key: "display"
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  ).lean();

  return normalizeDisplaySettings({
    showPrice: saved?.showPrice,
    showQuantity: saved?.showQuantity
  });
}

