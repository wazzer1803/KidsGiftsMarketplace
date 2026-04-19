"use client";

import Image from "@/components/ui/app-image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CartIndicator from "@/components/cart-indicator";
import { IconCart, IconMenu, IconUser, IconX } from "@/components/icons";
import { BRAND_LOGO_URL } from "@/lib/brand";

type User = {
  name?: string;
  role: "user" | "admin";
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/cart", label: "Cart" },
  { href: "/tickets", label: "Tickets" }
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (active) setUser(data.user ?? null);
      })
      .catch(() => {
        if (active) setUser(null);
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [menuOpen]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const mobileMenu =
    mounted && createPortal(
      <div
        className={`fixed inset-0 md:hidden ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        style={{ zIndex: 2147483000 }}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
          style={{ backgroundColor: "rgba(9, 7, 6, 0.72)", backdropFilter: "blur(2px)" }}
          aria-label="Close menu overlay"
        />

        <aside
          className={`absolute left-0 top-0 flex h-full w-[min(320px,86vw)] flex-col overflow-y-auto border-r border-outline-variant/60 px-4 pb-5 pt-4 transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            zIndex: 2147483001,
            backgroundColor: "#fffaf3",
            boxShadow: "0 24px 60px rgba(24,13,9,0.42)"
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-base font-black tracking-tight text-primary">Menu</p>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/45 bg-surface-container text-primary"
              aria-label="Close menu"
            >
              <IconX size={17} />
            </button>
          </div>

          <nav className="space-y-2">
            {navLinks.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 space-y-2 border-t border-outline-variant/30 pt-4">
            <Link href={user ? "/profile" : "/login"} className="btn-secondary w-full !justify-center">
              {user ? "My Profile" : "Login"}
            </Link>
            {user?.role === "admin" ? (
              <Link href="/admin" className="btn-secondary w-full !justify-center">
                Admin Dashboard
              </Link>
            ) : null}
            {user ? (
              <button type="button" className="btn-secondary w-full !justify-center" onClick={handleLogout}>
                Logout
              </button>
            ) : null}
          </div>
        </aside>
      </div>,
      document.body
    );

  return (
    <>
      <header className="fixed left-0 top-0 z-[2000] w-full border-b border-outline-variant/25 bg-[#fffaf3f2] shadow-[0_8px_26px_rgba(48,28,18,0.14)] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
          <div className="flex h-[74px] items-center justify-between gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant/50 bg-surface-container-lowest text-primary"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <IconMenu size={19} />
            </button>

            <Link href="/" className="min-w-0 flex-1 px-2 text-center">
              <p className="truncate text-[1.05rem] font-black tracking-tight text-primary">Home And Kids Corner</p>
            </Link>

            <Link
              href={user ? "/profile" : "/login"}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant/50 bg-surface-container-lowest text-primary"
              aria-label={user ? "Profile" : "Login"}
            >
              <IconUser size={18} />
            </Link>
          </div>

          <div className="hidden h-[80px] items-center gap-3 md:flex">
            <Link href="/" className="group flex min-w-0 flex-1 items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-1 shadow-sm shadow-primary/20">
                <Image
                  src={BRAND_LOGO_URL}
                  alt="Home And Kids Corner logo"
                  fill
                  loading="eager"
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-black leading-none tracking-tight text-primary lg:text-xl">
                  Home And Kids Corner
                </p>
                <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
                  Playful Picks For Little Creators
                </p>
              </div>
            </Link>

            <nav className="hidden flex-1 items-center justify-center gap-4 px-4 lg:flex lg:gap-5">
              {navLinks.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-semibold transition-colors lg:text-base ${
                      active ? "text-primary" : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-1 items-center justify-end gap-2 lg:gap-3">
              <Link
                href="/cart"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-primary transition-transform hover:scale-105"
                aria-label="Cart"
              >
                <IconCart size={18} />
                <CartIndicator />
              </Link>

              <Link href={user ? "/profile" : "/login"} className="btn-secondary hidden !px-4 !py-2 xl:inline-flex">
                {user ? "Profile" : "Login"}
              </Link>

              {user ? (
                <button className="btn-secondary hidden !px-4 !py-2 xl:inline-flex" onClick={handleLogout}>
                  Logout
                </button>
              ) : null}

              {user?.role === "admin" ? (
                <Link href="/admin" className="btn-secondary hidden !px-4 !py-2 xl:inline-flex">
                  Admin
                </Link>
              ) : null}

              <Link
                href="/profile"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary-container bg-surface-container-lowest text-primary transition-transform hover:scale-105"
                aria-label="Profile"
              >
                <IconUser size={18} />
              </Link>
            </div>
          </div>
        </div>
      </header>
      {mobileMenu}
    </>
  );
}
