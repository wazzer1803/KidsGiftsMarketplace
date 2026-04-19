export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function hasValidPrice(amount: number | null | undefined): amount is number {
  return typeof amount === "number" && Number.isFinite(amount) && amount >= 0;
}

export function formatOptionalINR(amount: number | null | undefined, fallback = "Price on request") {
  return hasValidPrice(amount) ? formatINR(amount) : fallback;
}

export function sanitizePhone(phone: string) {
  return phone.replace(/[^0-9+]/g, "").trim();
}

export function normalizePhoneForWhatsapp(phone: string) {
  return phone.replace(/\D/g, "");
}

export function sanitizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizeEmail(email));
}
