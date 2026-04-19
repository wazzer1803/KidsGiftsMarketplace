import SiteHeader from "@/components/site-header";
import MobileNav from "@/components/mobile-nav";
import { getCurrentUser } from "@/lib/auth";
import { getDisplaySettings } from "@/lib/site-settings";

export default async function ShopLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [settings, currentUser] = await Promise.all([getDisplaySettings(), getCurrentUser()]);
  const canShowPrice = settings.showPrice && Boolean(currentUser);

  return (
    <>
      <SiteHeader />
      <main
        className="mx-auto w-full max-w-7xl px-3 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-24 sm:px-4 md:px-6 md:pt-28"
        data-show-price={canShowPrice ? "true" : "false"}
        data-show-quantity={settings.showQuantity ? "true" : "false"}
      >
        {children}
      </main>
      <MobileNav />
    </>
  );
}
