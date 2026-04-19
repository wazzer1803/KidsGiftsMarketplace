"use client";

import { MouseEvent, ReactNode, useState } from "react";
import { ensureAuthenticatedOrRedirect } from "@/lib/client-auth";
import { buildWhatsappWebLink, openWhatsAppPreferApp } from "@/lib/whatsapp";

type WhatsAppAppLinkProps = {
  phone: string;
  message: string;
  className?: string;
  children: ReactNode;
  fallbackHref?: string;
  requireAuth?: boolean;
};

export default function WhatsAppAppLink({
  phone,
  message,
  className,
  children,
  fallbackHref = "/tickets",
  requireAuth = true
}: WhatsAppAppLinkProps) {
  const [checkingAuth, setCheckingAuth] = useState(false);
  const webLink = buildWhatsappWebLink(phone, message);
  const href = webLink || fallbackHref;

  async function openLinkWithAuth() {
    if (checkingAuth) {
      return;
    }

    if (requireAuth) {
      setCheckingAuth(true);
      const canContinue = await ensureAuthenticatedOrRedirect();
      setCheckingAuth(false);

      if (!canContinue) {
        return;
      }
    }

    if (webLink) {
      openWhatsAppPreferApp(phone, message);
      return;
    }

    window.location.href = href;
  }

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!requireAuth && !webLink) {
      return;
    }

    event.preventDefault();
    void openLinkWithAuth();
  }

  return (
    <a href={href} onClick={onClick} className={className} rel="noreferrer">
      {children}
    </a>
  );
}
