import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { quantity } = z.object({ quantity: z.number().int().positive() }).parse(await req.json());

    const item = await prisma.cartItem.findFirst({ where: { id, userId: session.user.id }, include: { product: true } });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (quantity > item.product.stock) return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });

    const updated = await prisma.cartItem.update({ where: { id }, data: { quantity }, include: { product: true } });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.cartItem.deleteMany({ where: { id, userId: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
