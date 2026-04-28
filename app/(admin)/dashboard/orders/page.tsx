import { prisma } from "@/lib/prisma";
import { AdminOrdersClient } from "@/components/features/admin/AdminOrdersClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Orders — Admin" };

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, email: true } },
      orderItems: { include: { product: { select: { name: true, images: true } } }, take: 2 },
    },
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl">Orders</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">Manage and update order statuses.</p>
      </div>
      <AdminOrdersClient initialOrders={orders as never} />
    </div>
  );
}
