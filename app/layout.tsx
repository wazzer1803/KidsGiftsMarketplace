import type { Metadata } from "next";
import { BRAND_LOGO_URL } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home And Kids Corner",
  description: "Kids marketplace with email-password login, tickets, and admin inventory dashboard.",
  icons: {
    icon: BRAND_LOGO_URL,
    shortcut: BRAND_LOGO_URL,
    apple: BRAND_LOGO_URL
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body className="bg-surface text-on-surface antialiased">{children}</body>
    </html>
  );
}
