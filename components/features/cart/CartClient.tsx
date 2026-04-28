"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { CartItem, Product } from "@/types";

interface CartClientProps {
  initialItems: (CartItem & { product: Product })[];
}

export function CartClient({ initialItems }: CartClientProps) {
  const [items, setItems] = useState(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  async function updateQty(itemId: string, quantity: number) {
    if (quantity < 1) return removeItem(itemId);
    setLoadingId(itemId);
    try {
      await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function removeItem(itemId: string) {
    setLoadingId(itemId);
    try {
      await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } finally {
      setLoadingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-6">
          <ShoppingBag size={32} className="text-[var(--color-text-subtle)]" />
        </div>
        <h2 className="font-display text-2xl mb-3">Your cart is empty</h2>
        <p className="text-[var(--color-text-muted)] mb-8 max-w-xs">
          Looks like you haven't added anything yet. Start exploring our collection.
        </p>
        <Link href="/products">
          <Button size="lg">
            Browse Products <ArrowRight size={16} className="ml-1" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Items */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="surface rounded-2xl p-4 flex items-start gap-4 transition-opacity"
            style={{ opacity: loadingId === item.id ? 0.6 : 1 }}
          >
            {/* Image */}
            <Link href={`/products/${item.product.slug}`} className="shrink-0">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[var(--color-surface-2)]">
                {item.product.images[0] ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-text-subtle)]">
                    <ShoppingBag size={20} />
                  </div>
                )}
              </div>
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[var(--color-text-subtle)] mb-0.5">
                    {item.product.category}
                  </p>
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="text-sm font-medium hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-[var(--color-text-subtle)] hover:text-[var(--color-error)] transition-colors p-1 shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-center justify-between mt-3">
                {/* Qty controls */}
                <div className="flex items-center surface-2 rounded-lg overflow-hidden h-8">
                  <button
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors disabled:opacity-30"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <span className="text-sm font-semibold">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="surface rounded-2xl p-6 sticky top-24 flex flex-col gap-4">
          <h2 className="font-display text-xl">Order Summary</h2>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between text-[var(--color-text-muted)]">
              <span>Subtotal ({items.length} items)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-muted)]">
              <span>Shipping</span>
              <span className={shipping === 0 ? "text-[var(--color-success)]" : ""}>
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-[11px] text-[var(--color-text-subtle)]">
                Add {formatPrice(999 - subtotal)} more for free shipping
              </p>
            )}
          </div>

          <div className="border-t border-[var(--color-border)] pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span className="font-display text-lg">{formatPrice(total)}</span>
          </div>

          <Link href="/checkout" className="w-full">
            <Button size="lg" className="w-full">
              Proceed to Checkout <ArrowRight size={16} className="ml-1" />
            </Button>
          </Link>

          <Link href="/products" className="text-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
