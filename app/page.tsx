import { HeroSection } from "@/components/features/product/HeroSection";
import { FeaturedProducts } from "@/components/features/product/FeaturedProducts";
import { CategoryGrid } from "@/components/features/product/CategoryGrid";
import { PromoSection } from "@/components/features/product/CategoryGrid";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { serializeProducts } from "@/lib/serializers";

export const metadata: Metadata = {
  title: "Karta — Premium Shopping Experience",
  description:
    "Discover curated collections. Elevated taste. Seamless checkout. That's Karta.",
};

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isFeatured: true, isPublished: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => ({
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

    const safeProducts = serializeProducts(featuredProducts);


  return (
    <>
      <HeroSection />
      <FeaturedProducts products={featuredProducts} />
      <CategoryGrid />
      <PromoSection />
    </>
  );
}
