import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import { z } from "zod";

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10).max(10),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const address = addressSchema.parse(body.address);

    // Fetch cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    });
    if (cartItems.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    // Calculate total
    const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const shipping = subtotal > 999 ? 0 : 99;
    const total = subtotal + shipping;

    // Create Razorpay order
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency: "INR",
      receipt: `karta_${Date.now()}`,
    });

    // Create order in DB with PENDING status
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total,
        status: "PENDING",
        razorpayOrderId: rzpOrder.id,
        address,
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: total,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
