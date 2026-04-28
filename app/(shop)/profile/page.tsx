import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { User, Mail, ShoppingBag, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { orders: true } } },
  });
  if (!user) redirect("/login");

  const recentOrders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, total: true, status: true, createdAt: true },
  });

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl sm:text-4xl mb-8">My Profile</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Orders", value: user._count.orders, icon: ShoppingBag },
            { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }), icon: Calendar },
            { label: "Account Type", value: user.role, icon: User },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} variant="default" padding="md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-dim)] flex items-center justify-center">
                  <Icon size={16} className="text-[var(--color-accent-2)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
                  <p className="font-semibold capitalize">{value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card variant="default" padding="lg" className="mb-6">
          <h2 className="font-display text-lg mb-5">Account Details</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent-dim)] flex items-center justify-center shrink-0">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name || ""} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <User size={18} className="text-[var(--color-accent-2)]" />
                )}
              </div>
              <div>
                <p className="font-medium">{user.name || "No name set"}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Display name</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                <Mail size={16} className="text-[var(--color-text-muted)]" />
              </div>
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Email address</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant={user.role === "ADMIN" ? "accent" : "default"}>{user.role}</Badge>
              {!user.password && <Badge variant="info">OAuth account</Badge>}
            </div>
          </div>
        </Card>

        {recentOrders.length > 0 && (
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg">Recent Orders</h2>
              <Link href="/orders"><Button variant="ghost" size="sm">View all</Button></Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentOrders.map((order : any) => (
                <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors">
                  <div>
                    <p className="text-xs font-mono text-[var(--color-text-muted)]">{order.id.slice(0, 16)}…</p>
                    <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "error" : "warning"}>
                      {order.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}