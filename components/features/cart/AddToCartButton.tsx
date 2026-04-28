"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toaster";
import type { Product } from "@/types";

export function AddToCartButton({ product }: { product: Product }) {
  const [qty,     setQty]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [added,   setAdded]   = useState(false);

  async function handleAdd() {
    if (product.stock === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ productId: product.id, quantity: qty }),
      });

      if (res.ok) {
        setAdded(true);
        toast.success("Added to cart", `${product.name} ×${qty}`);
        setTimeout(() => setAdded(false), 2000);
      } else {
        const data = await res.json();
        if (res.status === 401) {
          toast.error("Please sign in", "You need an account to add items to cart.");
        } else {
          toast.error("Couldn't add to cart", data.error || "Please try again.");
        }
      }
    } catch {
      toast.error("Network error", "Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--color-text-muted)]">Quantity</span>
        <div className="flex items-center surface rounded-xl overflow-hidden">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}
            className="w-10 h-10 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors text-lg font-light disabled:opacity-30">
            −
          </button>
          <span className="w-12 text-center text-sm font-medium">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}
            className="w-10 h-10 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors text-lg font-light disabled:opacity-30">
            +
          </button>
        </div>
      </div>

      <Button
        size="lg"
        onClick={handleAdd}
        loading={loading}
        disabled={product.stock === 0}
        className="w-full sm:w-auto gap-2"
        variant={added ? "secondary" : "primary"}
      >
        {added ? (
          <><Check size={16} />Added to Cart</>
        ) : (
          <><ShoppingCart size={16} />{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</>
        )}
      </Button>
    </div>
  );
}