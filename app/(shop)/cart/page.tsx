import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CartClient } from "@/components/features/cart/CartClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your cart and proceed to checkout.",
};

export default async function CartPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { id: "asc" },
  });

  // 🔥 Serialize Date → string
const safeCartItems = cartItems.map((item: any) => ({
  ...item,
  createdAt: item?.createdAt
    ? new Date(item.createdAt).toISOString()
    : null,

  updatedAt: item?.updatedAt
    ? new Date(item.updatedAt).toISOString()
    : null,

  product: {
    ...item.product,
  },
}));

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl sm:text-4xl mb-8">
          Your Cart
        </h1>

        <CartClient initialItems={safeCartItems} />
      </div>
    </div>
  );
}