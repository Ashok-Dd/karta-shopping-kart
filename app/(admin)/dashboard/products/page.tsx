import { prisma } from "@/lib/prisma";
import { AdminProductsClient } from "@/components/features/admin/AdminProductsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Products — Admin" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl">Products</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">Manage your product catalogue.</p>
      </div>
      <AdminProductsClient initialProducts={products as never} />
    </div>
  );
}
