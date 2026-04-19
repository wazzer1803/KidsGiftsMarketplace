"use client";

import { useState } from "react";
import { ensureAuthenticatedOrRedirect } from "@/lib/client-auth";
import { addToCart } from "@/lib/cart";

type AddToCartButtonProps = {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number | null;
    image?: string;
    inStock: boolean;
  };
};

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [message, setMessage] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(false);

  async function handleAddToCart() {
    if (!product.inStock || checkingAuth) {
      return;
    }

    setCheckingAuth(true);
    const canContinue = await ensureAuthenticatedOrRedirect();

    if (!canContinue) {
      setCheckingAuth(false);
      return;
    }

    addToCart(
      {
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        image: product.image,
        inStock: product.inStock
      },
      1
    );

    setMessage("Added to cart");
    setTimeout(() => setMessage(""), 1500);
    setCheckingAuth(false);
  }

  return (
    <div>
      <button className="btn-primary w-full" disabled={!product.inStock || checkingAuth} onClick={() => void handleAddToCart()}>
        {product.inStock ? (checkingAuth ? "Checking login..." : "Add to Cart") : "Out of Stock"}
      </button>
      {message ? <p className="mt-2 text-center text-xs font-semibold text-secondary">{message}</p> : null}
    </div>
  );
}
