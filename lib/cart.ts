export type CartItem = {
  id: string;
  title: string;
  slug: string;
  price: number | null;
  image?: string;
  quantity: number;
  inStock: boolean;
};

const STORAGE_KEY = "km_cart_items";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getCartItems(): CartItem[] {
  if (!canUseStorage()) return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setCartItems(items: CartItem[]) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  const items = getCartItems();
  const index = items.findIndex((entry) => entry.id === item.id);

  if (index >= 0) {
    items[index].quantity += quantity;
  } else {
    items.push({ ...item, quantity });
  }

  setCartItems(items);
}

export function removeFromCart(id: string) {
  const items = getCartItems().filter((item) => item.id !== id);
  setCartItems(items);
}

export function updateCartQuantity(id: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(id);
    return;
  }

  const items = getCartItems().map((item) => {
    if (item.id === id) {
      return { ...item, quantity };
    }

    return item;
  });

  setCartItems(items);
}

export function clearCart() {
  setCartItems([]);
}

export function getCartCount() {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}
