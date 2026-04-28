import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--color-text-subtle)] mb-2">
            Handpicked for You
          </p>
          <h2 className="font-display text-3xl sm:text-4xl">Featured Products</h2>
        </div>
        <Link
          href="/products?featured=true"
          className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors group"
        >
          View all
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 4} />
        ))}
      </div>

      <div className="flex sm:hidden justify-center mt-8">
        <Link
          href="/products?featured=true"
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          View all products <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
