import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { PRODUCTS, formatMoney } from "~/lib/mock-storefront";
import { TopNav } from "~/components/top-nav";
import { ProductCard } from "~/components/product-card";

export async function loader(_args: LoaderFunctionArgs) {
  return { products: PRODUCTS };
}

export default function Index() {
  const { products } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen bg-bg text-fg">
      <TopNav />

      {/* Hero */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 px-6 md:px-10">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="text-[11px] tracking-[0.32em] text-fg/40 mb-6">
              ◦ COLEÇÃO Nº 01 — LANÇAMENTO
            </div>
            <h1 className="text-display text-[44px] md:text-[112px] leading-[0.85] tracking-[-0.04em] text-fg">
              <span className="block">CLUB 001</span>
              <span className="block text-red italic-serif text-serif-italic" style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontWeight: 700, letterSpacing: "-0.02em" }}>
                Virtù
              </span>
            </h1>
            <p className="max-w-md mt-8 text-serif-italic text-fg/70 text-[18px] md:text-[20px] leading-relaxed">
              "Não se vence pelo acaso. Vence-se pela arte. A arte de escolher
              quem você é quando o sol nasce." — inspirados em Maquiavel,
              costurados para quem não pede desculpa.
            </p>
            <div className="mt-10 flex items-center gap-6">
              <Link
                to="/collections/club-001-virtu"
                className="group inline-flex items-center gap-3 text-display text-[12px] tracking-[0.22em] text-fg hover:text-red transition-colors"
              >
                <span className="border-b border-fg/40 group-hover:border-red pb-1">
                  VER A COLEÇÃO
                </span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <span className="text-[10.5px] tracking-[0.22em] text-fg/30">
                {products.length} PEÇAS · TAMANHOS P—GG
              </span>
            </div>
          </motion.div>

          {/* Manifesto strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 border-t border-fg/10 pt-10"
          >
            {[
              {
                tag: "01",
                title: "VIRTU",
                body: "A capacidade individual de moldar o destino. Não espere o acaso — vista-o.",
              },
              {
                tag: "02",
                title: "PARTY",
                body: "Noite, gelo, som alto. Roupas que sobrevivem ao after sem pedir desculpa.",
              },
              {
                tag: "03",
                title: "PROTOCOL",
                body: "Logo bordado no peito esquerdo. Sempre. Quem conhece, reconhece.",
              },
            ].map((m, i) => (
              <motion.div
                key={m.tag}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
              >
                <div className="text-[10px] tracking-[0.3em] text-fg/40 mb-3">
                  {m.tag} /
                </div>
                <h3 className="text-display text-[14px] tracking-[0.22em] text-fg mb-3">
                  {m.title}
                </h3>
                <p className="text-serif-italic text-fg/65 text-[14.5px] leading-relaxed">
                  {m.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Products grid */}
      <section className="border-t border-fg/10 px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-10 md:mb-14">
            <div>
              <div className="text-[10.5px] tracking-[0.3em] text-fg/40 mb-3">
                A COLEÇÃO
              </div>
              <h2 className="text-display text-[28px] md:text-[40px] tracking-[-0.03em]">
                CLUB 001 / VIRTU
              </h2>
            </div>
            <Link
              to="/collections/club-001-virtu"
              className="hidden md:inline text-display text-[11px] tracking-[0.22em] text-fg/70 hover:text-red transition-colors"
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
      <footer className="border-t border-fg/10 px-6 md:px-10 py-12">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 bg-red text-bg flex items-center justify-center font-display text-[10px]">
              P
            </span>
            <span className="text-display text-[11px] tracking-[0.22em]">
              O PRINCIPE
            </span>
          </div>
          <div className="flex items-center gap-6 text-[10.5px] tracking-[0.22em] text-fg/50">
            <a href="#" className="hover:text-fg transition-colors">INSTAGRAM</a>
            <a href="#" className="hover:text-fg transition-colors">CONTATO</a>
            <a href="#" className="hover:text-fg transition-colors">DEVOLUÇÕES</a>
          </div>
          <div className="text-[10px] tracking-[0.22em] text-fg/30">
            © 2026 · BRASIL
          </div>
        </div>
      </footer>
    </div>
  );
}