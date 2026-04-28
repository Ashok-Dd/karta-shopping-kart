import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { z } from "zod";

const schema = z.object({
  orderId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    // Verify signature
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });

    // Confirm order belongs to user
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.user.id, razorpayOrderId },
      include: { orderItems: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Update order status and decrement stock
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID", razorpayPaymentId },
      }),
      // Reduce stock for each item
      ...order.orderItems.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      ),
      // Clear cart
      prisma.cartItem.deleteMany({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
