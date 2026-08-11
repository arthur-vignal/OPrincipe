import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { motion } from "framer-motion";
import { getProductsByCollection } from "~/lib/mock-storefront";
import { TopNav } from "~/components/top-nav";
import { ProductCard } from "~/components/product-card";

export async function loader({ params }: LoaderFunctionArgs) {
  const slug = params.slug ?? "";
  return { products: getProductsByCollection(slug), slug };
}

export default function CollectionRoute() {
  const { products, slug } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen bg-bg text-fg">
      <TopNav />
      <main className="pt-28 pb-24 px-6 md:px-10">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-14 md:mb-20"
          >
            <div className="text-[10.5px] tracking-[0.3em] text-fg/40 mb-3">
              COLEÇÃO
            </div>
            <h1 className="text-display text-[40px] md:text-[64px] tracking-[-0.03em] uppercase">
              {slug}
            </h1>
            <p className="max-w-lg mt-5 text-serif-italic text-fg/65 text-[15px]">
              {products.length} peças. Cada uma bordada, numerada, pensada.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}