"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types";

interface OrderItem {
  product: { name: string; images: string[] };
}
interface AdminOrder {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  user: { name: string | null; email: string };
  orderItems: OrderItem[];
}

const ALL_STATUSES: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export function AdminOrdersClient({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.user.name || o.user.email).toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-50">
          <Input placeholder="Search orders…" leftIcon={<Search size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | "ALL")}
            className="h-10 pl-3 pr-8 bg-(--color-surface) border border-(--color-border) rounded-xl text-sm text-(--color-text)appearance-none cursor-pointer focus:border-(--color-accent) outline-none"
          >
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--color-text-subtle) pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="surface rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border) bg-(--color-surface-2)">
                {["Order", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left text-xs text-(--color-text-subtle) font-semibold uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-(--color-border)last:border-0 hover:bg-(--color-surface-2) transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-(--color-accent)">{order.id.slice(0, 12)}…</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.user.name || "—"}</p>
                    <p className="text-[11px] text-(--color-text-subtle)">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex -space-x-1">
                      {order.orderItems.slice(0, 3).map((item, i) => (
                        <div key={i} className="relative w-8 h-8 rounded-lg overflow-hidden border-2 text-(--color-text-subtle) bg-(--color-surface-2) shrink-0">
                          {item.product.images[0] && <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                          disabled={updatingId === order.id}
                          className="h-7 pl-2 pr-6 bg-(--color-surface-2) border border-(--color-border) rounded-lg text-xs text-(--color-text-muted) appearance-none cursor-pointer hover:border-(--color-accent) outline-none transition-colors disabled:opacity-50"
                        >
                          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-(--color-text-subtle) pointer-events-none" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-(--color-text-muted)">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-12 text-(--color-text-muted) text-sm">No orders found.</p>
          )}
        </div>
      </div>
    </>
  );
}
