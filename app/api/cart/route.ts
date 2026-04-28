import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const addSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { productId, quantity } = parsed.data;

    // Check product exists and has stock
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isPublished) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (product.stock < quantity) return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });

    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: session.user.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { userId: session.user.id, productId, quantity },
      include: { product: true },
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
