import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { orderItems: { include: { product: true }, take: 3 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl sm:text-4xl mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl surface flex items-center justify-center mb-6">
              <Package size={32} className="text-[var(--color-text-subtle)]" />
            </div>
            <h2 className="font-display text-2xl mb-3">No orders yet</h2>
            <p className="text-[var(--color-text-muted)] mb-8">Start shopping to see your orders here.</p>
            <Link href="/products"><Button size="lg">Start Shopping</Button></Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="surface rounded-2xl p-5 hover:border-[var(--color-accent)] transition-colors block"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-[var(--color-text-subtle)] mb-1">Order ID</p>
                    <p className="text-sm font-mono font-medium">{order.id.slice(0, 16)}…</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="relative w-11 h-11 rounded-lg overflow-hidden bg-[var(--color-surface-2)] border-2 border-[var(--color-bg)] shrink-0">
                        {item.product.images[0] && (
                          <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0 ml-2">
                    <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] hidden sm:block">View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
