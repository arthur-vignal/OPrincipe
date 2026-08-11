/**
 * cart.server.ts — Cookie-backed cart for the storefront.
 *
 * Stored in a single signed cookie. Add to cart / remove / update
 * / clear via server actions. In production this would talk to the
 * Shopify Cart API; here it's a local mirror so the UX can be
 * iterated before wiring real checkout.
 */

import { createCookie } from "@remix-run/node";
import type { Product, Variant } from "./mock-storefront";
import type { CartLine } from "./mock-storefront";

const CART_COOKIE = createCookie("principe.cart", {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 30, // 30 days
});

export async function readCart(request: Request): Promise<CartLine[]> {
  const cookieHeader = request.headers.get("Cookie");
  const raw = (await CART_COOKIE.parse(cookieHeader)) as CartLine[] | null;
  if (!raw || !Array.isArray(raw)) return [];
  return raw;
}

export async function writeCart(lines: CartLine[]): Promise<string> {
  return CART_COOKIE.serialize(lines);
}

export function lineId(variantId: string, size: string): string {
  return `${variantId}::${size}`;
}

export async function addToCart(
  request: Request,
  product: Product,
  variant: Variant,
  quantity: number = 1,
): Promise<{ cookie: string; lines: CartLine[] }> {
  const lines = await readCart(request);
  const id = lineId(variant.id, variant.title);
  const existing = lines.find((l) => l.id === id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    lines.push({
      id,
      productId: product.id,
      productHandle: product.handle,
      productTitle: product.title,
      variantTitle: variant.title,
      image: product.images[0]?.url ?? "",
      price: variant.price,
      quantity,
    });
  }
  const cookie = await writeCart(lines);
  return { cookie, lines };
}

export async function removeFromCart(
  request: Request,
  lineId: string,
): Promise<{ cookie: string; lines: CartLine[] }> {
  const lines = await readCart(request);
  const next = lines.filter((l) => l.id !== lineId);
  const cookie = await writeCart(next);
  return { cookie, lines: next };
}

export async function updateQuantity(
  request: Request,
  lineId: string,
  quantity: number,
): Promise<{ cookie: string; lines: CartLine[] }> {
  const lines = await readCart(request);
  const line = lines.find((l) => l.id === lineId);
  if (!line) {
    return { cookie: await writeCart(lines), lines };
  }
  if (quantity <= 0) {
    const next = lines.filter((l) => l.id !== lineId);
    const cookie = await writeCart(next);
    return { cookie, lines: next };
  }
  line.quantity = quantity;
  const cookie = await writeCart(lines);
  return { cookie, lines };
}

export function cartTotal(lines: CartLine[]): { subtotal: number; count: number } {
  const subtotal = lines.reduce((sum, l) => sum + Number(l.price.amount) * l.quantity, 0);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { subtotal, count };
}