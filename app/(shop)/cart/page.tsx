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

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl sm:text-4xl mb-8">Your Cart</h1>
        <CartClient
          initialItems={cartItems as Parameters<typeof CartClient>[0]["initialItems"]}
        />
      </div>
    </div>
  );
}
