"use client";

import { useEffect, useState } from "react";
import { getCartCount } from "@/lib/cart";

export default function CartIndicator() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => setCount(getCartCount());

    refresh();
    window.addEventListener("cart-updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("cart-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!count) {
    return null;
  }

  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary">
      {count > 99 ? "99+" : count}
    </span>
  );
}
