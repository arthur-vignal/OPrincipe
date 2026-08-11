import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import {
  getProductByHandle,
  formatMoney,
} from "~/lib/mock-storefront";
import { fetchProductByHandle } from "~/lib/shopify.server";
import { addToCart } from "~/lib/cart.server";
import { TopNav } from "~/components/top-nav";

export async function loader({ params }: LoaderFunctionArgs) {
  const handle = params.handle ?? "";
  try {
    const product = await fetchProductByHandle(handle);
    if (product) return { product, source: "shopify" };
  } catch (err) {
    console.error("[product] Shopify fetch failed, using mock:", err);
  }
  const product = getProductByHandle(handle);
  if (!product) {
    throw new Response("Not Found", { status: 404 });
  }
  return { product, source: "mock" };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const product = getProductByHandle(params.handle ?? "");
  if (!product) {
    throw new Response("Not Found", { status: 404 });
  }
  const form = await request.formData();
  const variantId = String(form.get("variantId") ?? "");
  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) {
    return json({ ok: false, error: "Tamanho inválido" }, { status: 400 });
  }
  const { cookie, lines } = await addToCart(request, product, variant, 1);
  const url = new URL(request.url);
  if (url.searchParams.get("redirect") === "cart") {
    return redirect("/cart", {
      headers: { "Set-Cookie": cookie },
    });
  }
  return json(
    { ok: true, lines },
    { headers: { "Set-Cookie": cookie } },
  );
}

export default function ProductRoute() {
  const { product } = useLoaderData<typeof loader>();
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [imageIdx, setImageIdx] = useState(0);
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const selectedVariant = product.variants.find((v) => v.id === variantId)!;

  return (
    <div className="min-h-screen bg-white text-black">
      <TopNav />
      <main className="pt-24 pb-24 px-6 md:px-10">
        <div className="max-w-[1440px] mx-auto">
          <Link
            to="/collections/club-001-virtu"
            className="inline-flex items-center gap-1.5 text-[10.5px] tracking-[0.22em] text-black/50 hover:text-black transition-colors mb-8"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            VOLTAR
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            {/* Gallery */}
            <div>
              <motion.div
                key={imageIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="aspect-[3/4] bg-white overflow-hidden"
              >
                <img
                  src={product.images[imageIdx]?.url}
                  alt={product.images[imageIdx]?.altText ?? product.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {product.images.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIdx(i)}
                      className={`w-16 h-20 border ${
                        i === imageIdx ? "border-red" : "border-black/20"
                      } overflow-hidden`}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="md:pt-8">
              <div className="text-[10px] tracking-[0.32em] text-red mb-3">
                ◦ CLUB 001 / VIRTU
              </div>
              <h1 className="text-display text-[28px] md:text-[42px] tracking-[-0.02em] leading-tight">
                {product.title}
              </h1>
              <div className="num text-black/85 text-[20px] mt-5">
                {formatMoney(product.priceRange.minVariantPrice)}
              </div>
              <p className="text-serif-italic text-black/65 text-[15px] mt-6 leading-relaxed">
                {product.description}
              </p>

              {/* Sizes */}
              <div className="mt-10">
                <div className="text-[10px] tracking-[0.22em] text-black/50 mb-3">
                  TAMANHO
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariantId(v.id)}
                      className={`min-w-[56px] h-11 border px-3 text-display text-[12px] tracking-[0.16em] transition-colors ${
                        v.id === variantId
                          ? "border-black text-black bg-fg/5"
                          : "border-black/25 text-black/65 hover:border-black/60 hover:text-black"
                      }`}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to cart */}
              <fetcher.Form method="post" className="mt-8">
                <input type="hidden" name="variantId" value={variantId} />
                <button
                  type="submit"
                  disabled={!selectedVariant.availableForSale}
                  className="group w-full h-14 bg-fg text-bg text-display text-[12px] tracking-[0.22em] inline-flex items-center justify-center gap-3 hover:bg-red transition-colors disabled:opacity-40"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {fetcher.state === "submitting"
                    ? "ADICIONANDO..."
                    : "ADICIONAR AO CARRINHO"}
                </button>
              </fetcher.Form>

              {fetcher.data?.ok && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-[11px] tracking-[0.2em] text-positive"
                >
                  ✓ ADICIONADO — TAMANHO {selectedVariant.title}
                </motion.p>
              )}

              {/* Meta */}
              <div className="mt-12 pt-8 border-t border-black/10 space-y-4 text-[12px] text-black/55">
                <div>
                  <span className="text-black/40 tracking-[0.18em] text-[10px] uppercase">
                    ENVIO
                  </span>
                  <p className="mt-1">
                    2–5 dias úteis para todo o Brasil. Frete grátis acima de
                    R$ 350.
                  </p>
                </div>
                <div>
                  <span className="text-black/40 tracking-[0.18em] text-[10px] uppercase">
                    TROCAS
                  </span>
                  <p className="mt-1">30 dias após o recebimento.</p>
                </div>
                <div>
                  <span className="text-black/40 tracking-[0.18em] text-[10px] uppercase">
                    NÚMERO
                  </span>
                  <p className="mt-1 num">#{product.id.slice(-4)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}