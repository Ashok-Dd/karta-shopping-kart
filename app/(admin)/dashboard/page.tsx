import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Package, Users, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

async function getStats() {
  const [totalOrders, totalProducts, totalUsers, recentOrders, revenue] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      }),
    ]);
  return {
    totalOrders,
    totalProducts,
    totalUsers,
    recentOrders,
    revenue: revenue._sum.total || 0,
  };
}

export default async function DashboardPage() {
  const { totalOrders, totalProducts, totalUsers, recentOrders, revenue } =
    await getStats();

  const stats = [
    {
      label: "Total Revenue",
      value: formatPrice(revenue),
      icon: TrendingUp,
      color: "text-[var(--color-success)]",
      bg: "bg-[var(--color-success)]/10",
    },
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: "text-[var(--color-info)]",
      bg: "bg-[var(--color-info)]/10",
    },
    {
      label: "Products",
      value: totalProducts.toLocaleString(),
      icon: Package,
      color: "text-[var(--color-warning)]",
      bg: "bg-[var(--color-warning)]/10",
    },
    {
      label: "Users",
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: "text-[var(--color-accent-2)]",
      bg: "bg-[var(--color-accent-dim)]",
    },
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">
          Welcome back. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} variant="default" padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">
                  {label}
                </p>
                <p className="font-display text-2xl font-semibold">{value}</p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}
              >
                <Icon size={18} className={color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg">Recent Orders</h2>
          <Link
            href="/orders"
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {["Order ID", "Customer", "Total", "Status", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-xs text-[var(--color-text-subtle)] font-medium pb-3 pr-4"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr
                  key={order.id}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-mono text-xs text-[var(--color-accent)] hover:underline"
                    >
                      {order.id.slice(0, 12)}…
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-muted)]">
                    {order.user.name || order.user.email}
                  </td>
                  <td className="py-3 pr-4 font-medium">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-3 pr-4">
                    <OrderStatusBadge status={order.status as never} />
                  </td>
                  <td className="py-3 text-[var(--color-text-muted)] text-xs">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <p className="text-center py-8 text-[var(--color-text-muted)] text-sm">
              No orders yet.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
