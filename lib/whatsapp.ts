import { normalizePhoneForWhatsapp } from "@/lib/utils";

export function buildWhatsappWebLink(phone: string, message: string) {
  const normalized = normalizePhoneForWhatsapp(phone);
  if (!normalized) return "";
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsappAppLink(phone: string, message: string) {
  const normalized = normalizePhoneForWhatsapp(phone);
  if (!normalized) return "";
  return `whatsapp://send?phone=${normalized}&text=${encodeURIComponent(message)}`;
}

export function openWhatsAppPreferApp(phone: string, message: string) {
  if (typeof window === "undefined") return;

  const appLink = buildWhatsappAppLink(phone, message);
  const webLink = buildWhatsappWebLink(phone, message);

  if (!appLink || !webLink) return;

  let appOpened = false;
  const markAppOpen = () => {
    if (document.hidden) {
      appOpened = true;
    }
  };

  document.addEventListener("visibilitychange", markAppOpen);

  const triggerFallback = () => {
    document.removeEventListener("visibilitychange", markAppOpen);
    if (!appOpened) {
      window.open(webLink, "_blank", "noopener,noreferrer");
    }
  };

  try {
    const bridge = document.createElement("iframe");
    bridge.style.display = "none";
    bridge.src = appLink;
    document.body.appendChild(bridge);
    window.setTimeout(() => bridge.remove(), 600);
  } catch {
    window.location.href = appLink;
  }

  window.setTimeout(triggerFallback, 950);
}
