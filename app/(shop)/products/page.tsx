import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/features/product/ProductCard";
import { ProductFilters } from "@/components/features/product/ProductFilters";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { Suspense } from "react";

interface SearchParams {
  category?: string;
  sort?: string;
  featured?: string;
  q?: string;
  page?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category;
  const query = params.q;
  const title = query
    ? `Search: "${query}" — Karta`
    : category
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} — Karta`
      : "All Products — Karta";
  return {
    title,
    description: `Shop ${category || "all products"} on Karta. Premium quality, curated selection.`,
  };
}

async function getProducts(params: SearchParams) {
  const page = parseInt(params.page || "1");
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { isPublished: true };
  if (params.category && !["sale", "new"].includes(params.category)) {
    where.category = { equals: params.category, mode: "insensitive" };
  }
  if (params.featured === "true") where.isFeatured = true;
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
      { tags: { has: params.q } },
    ];
  }

  const orderBy: Record<string, string> =
    params.sort === "price-asc"
      ? { price: "asc" }
      : params.sort === "price-desc"
        ? { price: "desc" }
        : params.sort === "popular"
          ? { reviewCount: "desc" }
          : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, take: pageSize, skip }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { products, total, page, totalPages } = await getProducts(params);

  const isSearch = !!params.q;
  const isFiltered = !!params.category || !!params.featured || !!params.sort;

  const heading = params.q
    ? `Results for "${params.q}"`
    : params.category
      ? params.category.charAt(0).toUpperCase() + params.category.slice(1)
      : "All Products";

  return (
    <div
      className="min-h-screen pt-20"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3">
          {/* Back / clear search button */}
          {(isSearch || isFiltered) && (
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm w-fit px-3 py-1.5 rounded-xl transition-colors"
              style={{
                color: "var(--color-text-muted)",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <ArrowLeft size={13} />
              {isSearch ? (
                <span className="flex items-center gap-1">
                  Clear search
                  <span
                    className="flex items-center justify-center w-4 h-4 rounded-full"
                    style={{ background: "var(--color-surface-2)" }}
                  >
                    <X size={10} />
                  </span>
                </span>
              ) : (
                "All Products"
              )}
            </Link>
          )}

          <div>
            <h1
              className="font-display font-semibold mb-1"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                color: "var(--color-text)",
              }}
            >
              {heading}
            </h1>
            <p
              style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}
            >
              {total} {total === 1 ? "product" : "products"}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className="w-full lg:w-56 shrink-0">
            <Suspense
              fallback={<div className="animate-shimmer h-64 rounded-2xl" />}
            >
              <ProductFilters currentParams={params as any} />
            </Suspense>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-5xl mb-5">🔍</p>
                <h3
                  className="font-display text-xl mb-2"
                  style={{ color: "var(--color-text)" }}
                >
                  No products found
                </h3>
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "0.875rem",
                  }}
                  className="mb-6"
                >
                  {isSearch
                    ? `No results for "${params.q}". Try a different search term.`
                    : "Try adjusting your filters."}
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: "var(--color-accent-2)", color: "#fff" }}
                >
                  <ArrowLeft size={14} /> Browse All Products
                </Link>
              </div>
            ) : (
              <>
                <Suspense fallback={<ProductGridSkeleton count={20} />}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                    {products.map((product: any, i: number) => (
                      <ProductCard
                        key={product.id}
                        product={
                          product as Parameters<
                            typeof ProductCard
                          >[0]["product"]
                        }
                        priority={i < 8}
                      />
                    ))}
                  </div>
                </Suspense>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <a
                          key={p}
                          href={`?${new URLSearchParams({
                            ...(params.q && { q: params.q }),
                            ...(params.category && {
                              category: params.category,
                            }),
                            ...(params.sort && { sort: params.sort }),
                            page: String(p),
                          }).toString()}`}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium transition-colors"
                          style={{
                            background:
                              p === page
                                ? "var(--color-accent-2)"
                                : "var(--color-surface)",
                            color:
                              p === page ? "#fff" : "var(--color-text-muted)",
                            border: `1px solid ${p === page ? "transparent" : "var(--color-border)"}`,
                          }}
                        >
                          {p}
                        </a>
                      ),
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
