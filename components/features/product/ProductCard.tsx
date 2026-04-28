"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { cn, formatPrice, getDiscountPercentage } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types";
import { toast } from "@/components/ui/Toaster";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discount =
    product.comparePrice
      ? getDiscountPercentage(product.price, product.comparePrice)
      : null;

  const mainImage = product.images[0] || "/placeholder-product.jpg";

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setAddingToCart(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!res.ok) throw new Error();
      toast.success("Item added to cart " , "To check, view your cart ")
    } catch {
      toast.error("Something went wrong .." , "Try again !")

      // toast error handled by cart hook
    } finally {
      setAddingToCart(false);
    }
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <article className="flex flex-col gap-3">
        {/* Image */}
        <div className="relative overflow-hidden rounded-2xl bg-[var(--color-surface)] aspect-square">
          {!imgError ? (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={priority}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-subtle)]">
              <ShoppingCart size={32} />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount && discount > 0 && (
              <span className="bg-[var(--color-error)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-[var(--color-accent-2)] text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-full">
                Featured
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-[var(--color-surface-2)]/90 text-[var(--color-text-muted)] text-[10px] font-medium px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted((v) => !v);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[var(--color-surface)]/80 backdrop-blur-sm flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-all opacity-0 group-hover:opacity-100 border border-[var(--color-border)]"
            aria-label="Add to wishlist"
          >
            <Heart
              size={14}
              className={cn(isWishlisted && "fill-[var(--color-error)] text-[var(--color-error)]")}
            />
          </button>

          {/* Quick Add */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddToCart}
              loading={addingToCart}
              disabled={product.stock === 0}
              className="w-full backdrop-blur-sm bg-[var(--color-surface)]/90 text-xs"
            >
              <ShoppingCart size={12} />
              {product.stock === 0 ? "Out of Stock" : "Quick Add"}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 px-0.5">
          <span className="text-[11px] uppercase tracking-wider text-[var(--color-text-subtle)] font-medium">
            {product.category}
          </span>
          <h3 className="text-sm font-medium text-[var(--color-text)] line-clamp-2 leading-snug group-hover:text-[var(--color-accent)] transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <Star size={11} className="fill-[var(--color-accent-2)] text-[var(--color-accent-2)]" />
              <span className="text-[11px] text-[var(--color-text-muted)]">
                {product.rating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-semibold text-[var(--color-text)]">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-xs text-[var(--color-text-subtle)] line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
