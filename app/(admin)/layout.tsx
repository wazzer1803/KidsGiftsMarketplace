import SiteHeader from "@/components/site-header";

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-3 pb-16 pt-24 sm:px-4 md:px-6 md:pt-28">{children}</main>
    </>
  );
}
