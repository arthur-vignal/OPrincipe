"use client";

import { Link, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Plus, Minus } from "lucide-react";
import type { CartLine } from "~/lib/mock-storefront";
import { cartTotal, formatMoney } from "~/lib/mock-storefront";

/**
 * TopNav — minimal two-item menu in Michroma:
 *   [O PRINCIPE]    [CLUB001]                    [CART (n)]
 * The cart drawer slides up from the right when CART is clicked.
 */

export function TopNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-bg/80 backdrop-blur-sm border-b border-fg/10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          <nav className="flex items-center gap-7 text-display text-[12px]">
            <Link
              to="/"
              className="tracking-[0.18em] text-fg hover:text-red transition-colors"
            >
              O PRINCIPE
            </Link>
            <Link
              to="/collections/club-001-virtu"
              className="tracking-[0.18em] text-fg hover:text-red transition-colors"
            >
              CLUB001
            </Link>
          </nav>
          <button
            onClick={() => setOpen(true)}
            className="text-display text-[11px] tracking-[0.18em] inline-flex items-center gap-2 hover:text-red transition-colors"
            aria-label="Abrir carrinho"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>CART</span>
            <CartCount />
          </button>
        </div>
      </header>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function CartCount() {
  // Read the cart cookie client-side via document.cookie.
  // Server already issues the cookie, we just reflect count in UI.
  const [count, setCount] = useState(0);
  useEffect(() => {
    function sync() {
      const m = document.cookie.match(/principe\.cart=([^;]+)/);
      if (!m) {
        setCount(0);
        return;
      }
      try {
        const raw = decodeURIComponent(m[1]);
        const lines = JSON.parse(raw) as CartLine[];
        const c = lines.reduce((sum, l) => sum + l.quantity, 0);
        setCount(c);
      } catch {
        setCount(0);
      }
    }
    sync();
    // Re-sync every second to catch cookie updates from server actions.
    const id = setInterval(sync, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="num text-[10px] text-fg/70">
      {count > 0 ? `(${count})` : "(0)"}
    </span>
  );
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-bg border-l border-fg/15 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-fg/10">
              <span className="text-display text-[12px] tracking-[0.18em]">CART</span>
              <button
                onClick={onClose}
                className="text-fg/70 hover:text-fg transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <CartLines />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CartLines() {
  const fetcher = useFetcher<{ lines: CartLine[] }>();
  const [lines, setLines] = useState<CartLine[]>([]);

  // Initial fetch
  useEffect(() => {
    fetcher.load("/cart?format=json");
  }, []);

  // Update when fetcher returns
  useEffect(() => {
    if (fetcher.data?.lines) setLines(fetcher.data.lines);
  }, [fetcher.data]);

  function update(id: string, quantity: number) {
    fetcher.submit(
      { intent: "update", lineId: id, quantity: String(quantity) },
      { method: "post", action: "/cart" },
    );
    setLines((cur) =>
      cur
        .map((l) => (l.id === id ? { ...l, quantity } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  function remove(id: string) {
    fetcher.submit(
      { intent: "remove", lineId: id },
      { method: "post", action: "/cart" },
    );
    setLines((cur) => cur.filter((l) => l.id !== id));
  }

  const { subtotal, count } = cartTotal(lines);

  if (lines.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <ShoppingBag className="w-10 h-10 text-fg/30 mb-4" />
        <p className="text-display text-[12px] tracking-[0.18em] text-fg/60">
          CARRINHO VAZIO
        </p>
        <p className="text-serif-italic text-fg/40 text-[13px] mt-2">
          O silêncio antes da primeira compra.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto divide-y divide-fg/10">
        {lines.map((l) => (
          <div key={l.id} className="px-6 py-4 flex gap-4">
            <img
              src={l.image}
              alt=""
              className="w-20 h-24 object-cover bg-muted"
            />
            <div className="flex-1 min-w-0">
              <Link
                to={`/products/${l.productHandle}`}
                onClick={() => window.dispatchEvent(new Event("cart-close"))}
                className="text-display text-[11px] tracking-[0.16em] text-fg hover:text-red transition-colors line-clamp-2"
              >
                {l.productTitle}
              </Link>
              <div className="text-[10px] tracking-[0.18em] text-fg/50 mt-1">
                TAMANHO {l.variantTitle}
              </div>
              <div className="num text-fg/85 text-[13px] mt-1">
                {formatMoney(l.price)}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => update(l.id, l.quantity - 1)}
                  className="w-6 h-6 border border-fg/30 flex items-center justify-center hover:border-red hover:text-red transition-colors"
                  aria-label="Diminuir"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="num text-[13px] w-6 text-center">
                  {l.quantity}
                </span>
                <button
                  onClick={() => update(l.id, l.quantity + 1)}
                  className="w-6 h-6 border border-fg/30 flex items-center justify-center hover:border-red hover:text-red transition-colors"
                  aria-label="Aumentar"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => remove(l.id)}
                  className="ml-auto text-[10px] tracking-[0.16em] text-fg/40 hover:text-red transition-colors"
                >
                  REMOVER
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-fg/10 px-6 py-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] tracking-[0.18em] text-fg/60">
            SUBTOTAL ({count})
          </span>
          <span className="num text-fg text-[18px]">
            {formatMoney({ amount: subtotal.toFixed(2), currencyCode: "BRL" })}
          </span>
        </div>
        <p className="text-serif-italic text-fg/40 text-[12px]">
          Frete e impostos calculados no checkout.
        </p>
        <button
          disabled
          className="w-full h-12 bg-red text-bg text-display text-[11px] tracking-[0.2em] disabled:opacity-50"
          title="Checkout Shopify será conectado em produção"
        >
          CHECKOUT — BREVE
        </button>
      </div>
    </>
  );
}