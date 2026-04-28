import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "@/components/features/cart/CheckoutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order securely.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  if (cartItems.length === 0) redirect("/cart");

  // ✅ Serialize Dates → strings
  const safeCartItems = cartItems.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    product: {
      ...item.product,
      createdAt: item.product.createdAt.toISOString(),
      updatedAt: item.product.updatedAt.toISOString(),
    },
  }));

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl sm:text-4xl mb-8">
          Checkout
        </h1>

        <CheckoutClient
          cartItems={safeCartItems}
          user={{
            id: session.user.id!,
            name: session.user.name,
            email: session.user.email!,
          }}
        />
      </div>
    </div>
  );
}