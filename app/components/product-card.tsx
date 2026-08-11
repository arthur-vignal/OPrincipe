"use client";

import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import type { Product } from "~/lib/mock-storefront";
import { formatMoney } from "~/lib/mock-storefront";

/**
 * ProductCard — used on home + collection grids.
 * On hover:
 *   - image cross-fades from front to back
 *   - subtle scale (1.02)
 *   - red glow via inset shadow
 *   - Michroma "VER" badge animates in
 */

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.handle}`}
      className="group block relative overflow-hidden"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="relative aspect-[3/4] overflow-hidden bg-bg"
      >
        {/* Front image */}
        <motion.img
          src={product.images[0]?.url}
          alt={product.images[0]?.altText ?? product.title}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 1 }}
          whileHover={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        />
        {/* Back image (if exists) */}
        {product.images[1] && (
          <motion.img
            src={product.images[1].url}
            alt={product.images[1].altText ?? product.title}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          />
        )}
        {/* Red glow on hover */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: "inset 0 0 80px rgba(216, 43, 28, 0.18)",
          }}
        />
        {/* Top-right tag */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <span className="text-display text-[10px] tracking-[0.2em] bg-red text-bg px-2.5 py-1 inline-block">
            VER
          </span>
        </div>
        {/* Bottom overlay with title on hover */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-display text-[10px] tracking-[0.2em] text-fg/85">
            VER DETALHES →
          </span>
        </div>
      </motion.div>
      <div className="mt-3 px-1">
        <h3 className="text-display text-[11px] tracking-[0.18em] text-fg">
          {product.title}
        </h3>
        <div className="flex items-baseline justify-between mt-1.5">
          <span className="num text-[12.5px] text-fg/80">
            {formatMoney(product.priceRange.minVariantPrice)}
          </span>
          <span className="text-[9.5px] tracking-[0.2em] text-fg/40">
            {product.variants.length} TAMANHOS
          </span>
        </div>
      </div>
    </Link>
  );
}