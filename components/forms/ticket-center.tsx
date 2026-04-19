"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { openWhatsAppPreferApp } from "@/lib/whatsapp";

type ProductOption = {
  id: string;
  title: string;
};

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  adminNotes?: string;
  createdAt: string;
  product?: {
    title?: string;
    slug?: string;
  };
  products?: Array<{
    id: string;
    title?: string;
    slug?: string;
  }>;
};

type User = {
  id: string;
  phone: string;
};

type TicketCenterProps = {
  products: ProductOption[];
};

export default function TicketCenter({ products }: TicketCenterProps) {
  const searchParams = useSearchParams();
  const preselectedProduct = searchParams.get("product") || "";
  const preselectedProducts = (searchParams.get("products") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const initialLinkedProducts = Array.from(new Set([preselectedProduct, ...preselectedProducts].filter(Boolean)));

  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(preselectedProduct);
  const [linkedProductIds, setLinkedProductIds] = useState<string[]>(initialLinkedProducts);

  async function loadTickets() {
    const meRes = await fetch("/api/auth/me", { cache: "no-store" });
    const meData = await meRes.json();

    if (!meData.user) {
      setUser(null);
      setTickets([]);
      setLoading(false);
      return;
    }

    setUser(meData.user);

    const ticketRes = await fetch("/api/tickets", { cache: "no-store" });
    const ticketData = await ticketRes.json();
    setTickets(ticketData.tickets || []);
    setLoading(false);
  }

  useEffect(() => {
    loadTickets().catch(() => {
      setLoading(false);
      setError("Could not load tickets");
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    const form = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.get("subject"),
          message: form.get("message"),
          productId: form.get("productId"),
          productIds: Array.from(
            new Set(
              [
                ...linkedProductIds,
                String(form.get("productId") || "")
                  .trim()
              ].filter(Boolean)
            )
          )
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create ticket");
      }

      if (data.whatsappLink) {
        try {
          const parsedLink = new URL(String(data.whatsappLink));
          const phone = parsedLink.pathname.replaceAll("/", "");
          const message = parsedLink.searchParams.get("text") || "";
          if (phone && message) {
            openWhatsAppPreferApp(phone, message);
          } else {
            window.open(String(data.whatsappLink), "_blank", "noopener,noreferrer");
          }
        } catch {
          window.open(String(data.whatsappLink), "_blank", "noopener,noreferrer");
        }
        setMessage("Ticket created. Admin can see it in dashboard and WhatsApp draft was opened.");
      } else {
        setMessage("Ticket created. Admin can now see it in dashboard.");
      }
      (event.target as HTMLFormElement).reset();
      setSelectedProduct("");
      setLinkedProductIds([]);
      await loadTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="soft-card rounded-3xl p-6">Loading ticket center...</div>;
  }

  if (!user) {
    return (
      <div className="soft-card rounded-3xl p-6">
        <h2 className="text-2xl font-black">Login required</h2>
        <p className="mt-2 text-sm text-on-surface-variant">Use email-password login before creating support tickets.</p>
        <a href="/login?next=/tickets" className="btn-primary mt-4">
          Login
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="soft-card rounded-3xl p-6 md:p-8" onSubmit={handleSubmit}>
        <h2 className="text-3xl font-black">Create Ticket</h2>
        <p className="mt-2 text-sm text-on-surface-variant">Your phone: {user.phone}</p>

        {linkedProductIds.length ? (
          <div className="mt-4 rounded-2xl border border-secondary/30 bg-secondary/10 px-3 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary">Linked from Cart</p>
            <p className="mt-1 text-sm text-secondary">
              {linkedProductIds.length} product(s) linked. Ticket will be attached to selected cart items.
            </p>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          <div>
            <label className="label-text" htmlFor="subject">
              Subject
            </label>
            <input id="subject" name="subject" className="input-plain" required placeholder="Issue with an order / question" />
          </div>

          <div>
            <label className="label-text" htmlFor="productId">
              Related Product (optional)
            </label>
            <select
              id="productId"
              name="productId"
              className="input-plain"
              value={selectedProduct}
              onChange={(event) => setSelectedProduct(event.target.value)}
            >
              <option value="">None</option>
              {products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          {linkedProductIds.length ? (
            <div>
              <p className="label-text">Linked Products</p>
              <div className="flex flex-wrap gap-2">
                {linkedProductIds.map((id) => {
                  const label = products.find((item) => item.id === id)?.title || id;

                  return (
                    <button
                      key={id}
                      type="button"
                      className="rounded-full border border-outline-variant/60 bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface"
                      onClick={() => setLinkedProductIds((prev) => prev.filter((item) => item !== id))}
                    >
                      {label} x
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div>
            <label className="label-text" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="input-plain"
              placeholder="Share order details or your question"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary mt-6" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Ticket"}
        </button>

        {message ? <p className="mt-3 text-sm font-semibold text-secondary">{message}</p> : null}
        {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
      </form>

      <div className="soft-card rounded-3xl p-6 md:p-8">
        <h3 className="text-2xl font-black">My Tickets</h3>

        <div className="mt-5 space-y-4">
          {tickets.length ? (
            tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-on-surface">{ticket.subject}</h4>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {new Date(ticket.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="rounded-full bg-surface-container-lowest px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-3 text-sm text-on-surface-variant">{ticket.message}</p>
                {ticket.product?.title ? (
                  <p className="mt-2 text-xs font-semibold text-secondary">Product: {ticket.product.title}</p>
                ) : null}
                {ticket.products && ticket.products.length > 1 ? (
                  <p className="mt-2 text-xs font-semibold text-secondary">
                    Linked products: {ticket.products.map((item) => item.title || item.id).join(", ")}
                  </p>
                ) : null}
                {ticket.adminNotes ? (
                  <p className="mt-2 rounded-xl bg-secondary/10 px-3 py-2 text-xs text-secondary">
                    Admin note: {ticket.adminNotes}
                  </p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-on-surface-variant">No tickets yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
