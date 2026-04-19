"use client";

import Image from "@/components/ui/app-image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WhatsAppAppLink from "@/components/whatsapp-app-link";
import { CartItem, clearCart, getCartItems, removeFromCart, updateCartQuantity } from "@/lib/cart";
import { formatINR, formatOptionalINR, hasValidPrice } from "@/lib/utils";

type CartPanelProps = {
  showPrice: boolean;
  whatsappNumber: string;
};

export default function CartPanel({ showPrice, whatsappNumber }: CartPanelProps) {
  const [items, setItems] = useState<CartItem[]>([]);

  function refresh() {
    setItems(getCartItems());
  }

  useEffect(() => {
    refresh();
    window.addEventListener("cart-updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("cart-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (hasValidPrice(item.price) ? item.price * item.quantity : 0), 0),
    [items]
  );

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const cartLines = items.flatMap((item, index) => [
    `${index + 1}. Product Name: ${item.title}`,
    `Quantity: ${item.quantity}`,
    showPrice ? `Price: ${formatOptionalINR(item.price)}` : "",
    item.image ? `Product Image: ${item.image}` : "",
    baseUrl ? `Product URL: ${baseUrl}/product/${item.slug}` : "",
    showPrice ? `Subtotal: ${hasValidPrice(item.price) ? formatINR(item.price * item.quantity) : "On request"}` : "",
    ""
  ]);
  const cartMessage = [
    "Hi, I want to order these items:",
    ...cartLines,
    showPrice ? `Total: ${formatINR(total)}` : ""
  ]
    .filter(Boolean)
    .join("\n");
  const ticketProductIds = Array.from(new Set(items.map((item) => item.id).filter(Boolean)));
  const ticketLink = ticketProductIds.length
    ? `/tickets?products=${encodeURIComponent(ticketProductIds.join(","))}`
    : "/tickets";

  if (!items.length) {
    return (
      <div className="soft-card rounded-3xl p-8 text-center">
        <h2 className="text-3xl font-black">Your cart is empty</h2>
        <p className="mt-2 text-on-surface-variant">Add products from categories to build your order.</p>
        <Link href="/categories" className="btn-primary mt-5">
          Browse Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="soft-card flex gap-4 rounded-3xl p-4 md:p-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface-container-low">
              {item.image ? <Image src={item.image} alt={item.title} fill className="object-cover" sizes="120px" /> : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Link href={`/product/${item.slug}`} className="break-words text-lg font-bold hover:text-primary">
                {item.title}
              </Link>
              <p className="js-price text-sm font-semibold text-secondary">{formatOptionalINR(item.price)}</p>
              <div className="mt-auto flex items-center gap-2">
                <button
                  className="btn-secondary !h-9 !w-9 !rounded-full !p-0"
                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                <button
                  className="btn-secondary !h-9 !w-9 !rounded-full !p-0"
                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
                <button className="ml-3 text-xs font-semibold text-red-600" onClick={() => removeFromCart(item.id)}>
                  Remove
                </button>
              </div>
            </div>
            <div className="js-price text-right text-sm font-bold text-on-surface">
              {hasValidPrice(item.price) ? formatINR(item.price * item.quantity) : "On request"}
            </div>
          </article>
        ))}
      </div>

      <aside className="soft-card h-fit rounded-3xl p-6 md:p-7">
        <h3 className="text-2xl font-black">Order Summary</h3>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Items</span>
            <span>{items.length}</span>
          </div>
          <div className="js-price flex justify-between text-lg font-black text-secondary">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
        </div>

        <WhatsAppAppLink phone={whatsappNumber} message={cartMessage} className="btn-primary mt-5 w-full !justify-center">
          Order via WhatsApp
        </WhatsAppAppLink>
        <Link href={ticketLink} className="btn-secondary mt-3 w-full !justify-center">
          Raise Ticket for Cart Items
        </Link>
        <button className="btn-secondary mt-3 w-full !justify-center" onClick={clearCart}>
          Clear Cart
        </button>
      </aside>
    </div>
  );
}

