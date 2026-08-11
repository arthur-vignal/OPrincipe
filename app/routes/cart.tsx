import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { readCart, updateQuantity, removeFromCart, cartTotal } from "~/lib/cart.server";
import { formatMoney } from "~/lib/mock-storefront";
import { TopNav } from "~/components/top-nav";

export async function loader({ request }: LoaderFunctionArgs) {
  const lines = await readCart(request);
  const totals = cartTotal(lines);
  // ?format=json is used by the TopNav drawer to refresh count
  const url = new URL(request.url);
  if (url.searchParams.get("format") === "json") {
    return json({ lines, totals });
  }
  return { lines, totals };
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const lineId = String(form.get("lineId") ?? "");
  if (!lineId) {
    return json({ ok: false });
  }
  let result: { cookie: string; lines: typeof Array.prototype };
  if (intent === "remove") {
    result = await removeFromCart(request, lineId);
  } else if (intent === "update") {
    const q = Math.max(0, Math.floor(Number(form.get("quantity") ?? 1)));
    result = await updateQuantity(request, lineId, q);
  } else {
    return json({ ok: false });
  }
  return json({ ok: true, lines: result.lines }, {
    headers: { "Set-Cookie": result.cookie },
  });
}

export default function CartRoute() {
  const { lines, totals } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen bg-white text-black">
      <TopNav />
      <main className="pt-28 pb-24 px-6 md:px-10">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-[10.5px] tracking-[0.3em] text-black/40 mb-3">
            SACOLA
          </div>
          <h1 className="text-display text-[40px] md:text-[56px] tracking-[-0.03em] mb-10">
            CARRINHO
          </h1>
          {lines.length === 0 ? (
            <div className="border border-black/10 px-8 py-16 text-center">
              <p className="text-display text-[12px] tracking-[0.22em] text-black/50">
                CARRINHO VAZIO
              </p>
              <a
                href="/collections/club-001-virtu"
                className="inline-block mt-6 text-display text-[11px] tracking-[0.22em] text-black border-b border-black/40 hover:border-red hover:text-red transition-colors pb-1"
              >
                VER A COLEÇÃO →
              </a>
            </div>
          ) : (
            <>
              <div className="border-t border-black/10">
                {lines.map((l) => (
                  <CartLineFull key={l.id} line={l} />
                ))}
              </div>
              <div className="mt-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-t border-black/10 pt-6">
                <div>
                  <div className="text-[10px] tracking-[0.22em] text-black/40">
                    SUBTOTAL ({totals.count} {totals.count === 1 ? "peça" : "peças"})
                  </div>
                  <div className="num text-[28px] text-black mt-1">
                    {formatMoney({ amount: totals.subtotal.toFixed(2), currencyCode: "BRL" })}
                  </div>
                </div>
                <button
                  disabled
                  className="bg-red text-bg text-display text-[11px] tracking-[0.22em] h-14 px-12 disabled:opacity-50"
                  title="Checkout Shopify será conectado em produção"
                >
                  CHECKOUT — BREVE
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function CartLineFull({ line }: { line: any }) {
  return (
    <div className="border-b border-black/10 py-6 flex items-center gap-6">
      <img src={line.image} alt="" className="w-24 h-28 object-cover bg-white" />
      <div className="flex-1 min-w-0">
        <div className="text-display text-[12px] tracking-[0.18em]">
          {line.productTitle}
        </div>
        <div className="text-[10px] tracking-[0.22em] text-black/50 mt-1">
          TAMANHO {line.variantTitle}
        </div>
        <div className="num text-black/85 text-[14px] mt-2">
          {formatMoney(line.price)} × {line.quantity}
        </div>
      </div>
      <div className="num text-black text-[18px]">
        {formatMoney({
          amount: (Number(line.price.amount) * line.quantity).toFixed(2),
          currencyCode: "BRL",
        })}
      </div>
    </div>
  );
}