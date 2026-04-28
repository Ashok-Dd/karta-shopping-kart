import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { AddToCartButton } from "@/components/features/cart/AddToCartButton";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/features/product/ProductCard";
import { Star, Truck, Shield, RefreshCw } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product Not Found" };

  return {
    title: `Buy ${product.name} Online`,
    description: product.description.slice(0, 160),
    keywords: [product.name, product.category, ...product.tags],
    openGraph: {
      title: `Buy ${product.name} Online | Karta`,
      description: product.description.slice(0, 200),
      images: product.images[0]
        ? [{ url: product.images[0], alt: product.name }]
        : [],
    },
  };
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { slug: true },
    where: { isPublished: true },
    take: 200,
  });
  return products.map((p: unknown) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isPublished: true },
  });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
      isPublished: true,
    },
    take: 4,
  });

  const discount = product.comparePrice
    ? getDiscountPercentage(product.price, product.comparePrice)
    : null;

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[var(--color-text-subtle)] mb-8">
            <a
              href="/"
              className="hover:text-[var(--color-text)] transition-colors"
            >
              Home
            </a>
            <span>/</span>
            <a
              href="/products"
              className="hover:text-[var(--color-text)] transition-colors"
            >
              Products
            </a>
            <span>/</span>
            <a
              href={`/products?category=${product.category.toLowerCase()}`}
              className="hover:text-[var(--color-text)] transition-colors capitalize"
            >
              {product.category}
            </a>
            <span>/</span>
            <span className="text-[var(--color-text-muted)] truncate max-w-[160px]">
              {product.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
            {/* Images */}
            <div className="flex flex-col gap-3">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-[var(--color-surface)]">
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-text-subtle)]">
                    No Image
                  </div>
                )}
                {discount && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="error">-{discount}%</Badge>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((img: unknown, i: number) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-accent)] transition-colors"
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="default">{product.category}</Badge>
                  {product.isFeatured && (
                    <Badge variant="accent">Featured</Badge>
                  )}
                  {product.stock === 0 && (
                    <Badge variant="error">Out of Stock</Badge>
                  )}
                </div>
                <h1 className="font-display text-3xl sm:text-4xl mb-3">
                  {product.name}
                </h1>

                {/* Rating */}
                {product.reviewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < Math.round(product.rating)
                              ? "fill-[var(--color-accent-2)] text-[var(--color-accent-2)]"
                              : "text-[var(--color-border-strong)]"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {product.rating.toFixed(1)} ({product.reviewCount}{" "}
                      reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-semibold">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="text-lg text-[var(--color-text-subtle)] line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
                {discount && (
                  <span className="text-sm font-semibold text-[var(--color-success)]">
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                {product.description}
              </p>

              {/* Stock info */}
              <p className="text-sm text-[var(--color-text-muted)]">
                {product.stock > 10 ? (
                  <span className="text-[var(--color-success)]">In Stock</span>
                ) : product.stock > 0 ? (
                  <span className="text-[var(--color-warning)]">
                    Only {product.stock} left
                  </span>
                ) : (
                  <span className="text-[var(--color-error)]">
                    Out of Stock
                  </span>
                )}
              </p>

              {/* Add to Cart */}
              <AddToCartButton
                product={
                  product as Parameters<typeof AddToCartButton>[0]["product"]
                }
              />

              {/* Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[var(--color-border)]">
                {[
                  { icon: Truck, text: "Free delivery above ₹999" },
                  { icon: RefreshCw, text: "30-day easy returns" },
                  { icon: Shield, text: "Secure checkout" },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]"
                  >
                    <Icon
                      size={13}
                      className="shrink-0 text-[var(--color-accent-2)]"
                    />
                    {text}
                  </div>
                ))}
              </div>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-[var(--color-text-subtle)]">
                    Tags:
                  </span>
                  {product.tags.map((tag: unknown) => (
                    <a
                      key={tag}
                      href={`/products?q=${tag}`}
                      className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
                    >
                      {tag}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <section className="mt-24">
              <h2 className="font-display text-2xl sm:text-3xl mb-8">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                {related.map((p: unknown) => (
                  <ProductCard
                    key={p.id}
                    product={p as Parameters<typeof ProductCard>[0]["product"]}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
