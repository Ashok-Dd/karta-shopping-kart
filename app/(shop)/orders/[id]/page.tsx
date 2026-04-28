import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { CheckCircle, Circle, Package, Truck, Home } from "lucide-react";
import type { Metadata } from "next";
import type { OrderStatus, Address } from "@/types";

export const metadata: Metadata = { title: "Order Details", robots: { index: false, follow: false } };

interface PageProps { params: Promise<{ id: string }> }

const timeline: { status: OrderStatus; icon: React.ElementType; label: string; desc: string }[] = [
  { status: "PENDING",   icon: Circle,      label: "Order Placed",  desc: "We've received your order" },
  { status: "PAID",      icon: CheckCircle, label: "Payment Done",  desc: "Payment confirmed" },
  { status: "SHIPPED",   icon: Truck,       label: "Shipped",       desc: "On its way to you" },
  { status: "DELIVERED", icon: Home,        label: "Delivered",     desc: "Enjoy your purchase!" },
];

const statusOrder: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { orderItems: { include: { product: true } } },
  });
  if (!order) notFound();

  const currentIdx = statusOrder.indexOf(order.status as OrderStatus);
  const address = order.address as Address;

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <Link href="/orders" className="text-xs text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors mb-2 block">← Back to Orders</Link>
            <h1 className="font-display text-2xl sm:text-3xl">Order Details</h1>
            <p className="text-xs font-mono text-[var(--color-text-muted)] mt-1">{order.id}</p>
          </div>
          <OrderStatusBadge status={order.status as OrderStatus} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Timeline */}
            {order.status !== "CANCELLED" && (
              <div className="surface rounded-2xl p-6">
                <h2 className="font-display text-lg mb-6">Order Timeline</h2>
                <div className="flex flex-col gap-0">
                  {timeline.map(({ status, icon: Icon, label, desc }, i) => {
                    const done = i <= currentIdx;
                    const active = i === currentIdx;
                    return (
                      <div key={status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${done ? "border-[var(--color-accent-2)] bg-[var(--color-accent-dim)]" : "border-[var(--color-border)]"}`}>
                            <Icon size={14} className={done ? "text-[var(--color-accent-2)]" : "text-[var(--color-text-subtle)]"} />
                          </div>
                          {i < timeline.length - 1 && (
                            <div className={`w-0.5 h-10 mt-1 ${done && i < currentIdx ? "bg-[var(--color-accent-2)]" : "bg-[var(--color-border)]"}`} />
                          )}
                        </div>
                        <div className="pb-8 pt-1">
                          <p className={`text-sm font-medium ${done ? "text-[var(--color-text)]" : "text-[var(--color-text-subtle)]"} ${active ? "text-[var(--color-accent-2)]" : ""}`}>{label}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="surface rounded-2xl p-6">
              <h2 className="font-display text-lg mb-4">Items Ordered</h2>
              <div className="flex flex-col gap-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[var(--color-surface-2)] shrink-0">
                      {item.product.images[0] && <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.slug}`}>
                        <p className="text-sm font-medium hover:text-[var(--color-accent)] transition-colors line-clamp-1">{item.product.name}</p>
                      </Link>
                      <p className="text-xs text-[var(--color-text-muted)]">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="flex flex-col gap-4">
            {/* Payment */}
            <div className="surface rounded-2xl p-5">
              <h3 className="font-display text-base mb-3">Payment Summary</h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-[var(--color-text-muted)]"><span>Subtotal</span><span>{formatPrice(order.total)}</span></div>
                <div className="flex justify-between text-[var(--color-text-muted)]"><span>Shipping</span><span className="text-[var(--color-success)]">Free</span></div>
                <div className="flex justify-between font-semibold border-t border-[var(--color-border)] pt-2 mt-1"><span>Total</span><span>{formatPrice(order.total)}</span></div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="surface rounded-2xl p-5">
              <h3 className="font-display text-base mb-3 flex items-center gap-2">
                <Package size={14} /> Delivery Address
              </h3>
              <div className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                <p className="font-medium text-[var(--color-text)]">{address.fullName}</p>
                <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
                <p>{address.city}, {address.state}</p>
                <p>{address.pincode}</p>
                <p className="mt-1">{address.phone}</p>
              </div>
            </div>

            {/* Order date */}
            <div className="surface rounded-2xl p-5 text-sm">
              <p className="text-[var(--color-text-subtle)] text-xs mb-1">Ordered on</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
