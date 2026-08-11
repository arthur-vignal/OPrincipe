import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { PRODUCTS, formatMoney } from "~/lib/mock-storefront";
import { fetchAllProducts } from "~/lib/shopify.server";
import { TopNav } from "~/components/top-nav";
import { ProductCard } from "~/components/product-card";
import { VideoHero } from "~/components/video-hero";

export async function loader(_args: LoaderFunctionArgs) {
  try {
    const products = await fetchAllProducts(25);
    if (products.length > 0) return { products, source: "shopify" };
  } catch (err) {
    console.error("[home] Shopify fetch failed, using mock:", err);
  }
  return { products: PRODUCTS, source: "mock" };
}

export default function Index() {
  const { products } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen bg-white text-black">
      <TopNav />

      {/* Hero — full-bleed video with manifesto overlay */}
      <section className="pt-14">
        <VideoHero
          videoSrc="/videos/hero-ascii-tiny.mp4"
          manifesto="Todos veem o que tu aparentas, poucos sentem aquilo que tu és."
        />
      </section>

      {/* Products grid */}
      <section className="border-t border-black/10 px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-10 md:mb-14">
            <div>
              <div className="text-[10.5px] tracking-[0.3em] text-black/40 mb-3">
                A COLEÇÃO
              </div>
              <h2 className="text-display text-[28px] md:text-[40px] tracking-[-0.03em]">
                CLUB 001 / VIRTU
              </h2>
            </div>
            <Link
              to="/collections/club-001-virtu"
              className="hidden md:inline text-display text-[11px] tracking-[0.22em] text-black/70 hover:text-red transition-colors"
            >
              TODOS →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10 px-6 md:px-10 py-12">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 bg-red text-bg flex items-center justify-center font-display text-[10px]">
              P
            </span>
            <span className="text-display text-[11px] tracking-[0.22em]">
              O PRINCIPE
            </span>
          </div>
          <div className="flex items-center gap-6 text-[10.5px] tracking-[0.22em] text-black/50">
            <a href="#" className="hover:text-black transition-colors">INSTAGRAM</a>
            <a href="#" className="hover:text-black transition-colors">CONTATO</a>
            <a href="#" className="hover:text-black transition-colors">DEVOLUÇÕES</a>
          </div>
          <div className="text-[10px] tracking-[0.22em] text-black/30">
            © 2026 · BRASIL
          </div>
        </div>
      </footer>
    </div>
  );
}