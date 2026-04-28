import { AdminUsersClient } from "@/components/features/admin/AdminUsersClient";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Users — Admin" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, name: true, email: true, image: true,
      role: true, createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl" style={{ color: "var(--color-text)" }}>Users</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          Manage customer accounts and roles.
        </p>
      </div>
      <AdminUsersClient initialUsers={users as never} />
    </div>
  );
}