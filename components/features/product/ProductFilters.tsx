"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  currentParams: Record<string, string | undefined>;
}

const categories = [
  "Electronics", "Fashion", "Home", "Beauty", "Sports", "Books",
  "Toys", "Automotive", "Health", "Food",
];

const sortOptions = [
  { value: "createdAt", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function ProductFilters({ currentParams }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function applyFilter(key: string, value: string | undefined) {
    const next = { ...currentParams };
    if (value) next[key] = value;
    else delete next[key];
    delete next.page;
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(next).filter(([, v]) => v !== undefined)) as Record<string, string>
    ).toString();
    router.push(`${pathname}?${qs}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  const hasFilters = Object.keys(currentParams).some((k) => k !== "page");

  const content = (
    <div className="flex flex-col gap-6">
      {/* Sort */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-subtle)] mb-3">
          Sort By
        </p>
        <div className="flex flex-col gap-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyFilter("sort", opt.value)}
              className={cn(
                "text-left text-sm px-3 py-2 rounded-lg transition-colors",
                currentParams.sort === opt.value
                  ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-subtle)] mb-3">
          Category
        </p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => applyFilter("category", undefined)}
            className={cn(
              "text-left text-sm px-3 py-2 rounded-lg transition-colors",
              !currentParams.category
                ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => applyFilter("category", cat.toLowerCase())}
              className={cn(
                "text-left text-sm px-3 py-2 rounded-lg transition-colors",
                currentParams.category === cat.toLowerCase()
                  ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="w-full justify-center gap-1.5">
          <X size={12} /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden mb-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="gap-2"
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasFilters && (
            <span className="w-4 h-4 rounded-full bg-[var(--color-accent-2)] text-[#0a0a0a] text-[10px] font-bold flex items-center justify-center">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[var(--color-bg)] border-l border-[var(--color-border)] p-6 overflow-y-auto animate-slide-down">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setMobileOpen(false)}><X size={18} /></button>
            </div>
            {content}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block surface rounded-2xl p-5 sticky top-24">
        {content}
      </div>
    </>
  );
}
