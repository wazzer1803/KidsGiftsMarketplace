import CartPanel from "@/components/forms/cart-panel";
import { getCurrentUser } from "@/lib/auth";
import { getDisplaySettings } from "@/lib/site-settings";
import { getWhatsAppOrderSettings } from "@/lib/whatsapp-order-settings";

export default async function CartPage() {
  const [settings, whatsappSettings, currentUser] = await Promise.all([
    getDisplaySettings(),
    getWhatsAppOrderSettings(),
    getCurrentUser()
  ]);
  const canShowPrice = settings.showPrice && Boolean(currentUser);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Shopping</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">Your Cart</h1>
        <p className="mt-2 text-on-surface-variant">
          Review items, update quantities, and send final order details to WhatsApp.
        </p>
      </div>
      <CartPanel showPrice={canShowPrice} whatsappNumber={whatsappSettings.activeWhatsappNumber || ""} />
    </section>
  );
}
