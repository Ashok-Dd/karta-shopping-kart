// lib/serializers.ts
export function serializeProducts(products: any[]) {
  return products.map((product) => ({
    ...product,
    createdAt: product.createdAt?.toISOString?.(),
    updatedAt: product.updatedAt?.toISOString?.(),
  }));
}