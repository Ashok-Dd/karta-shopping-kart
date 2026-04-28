import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status");
    const pageSize = 20;

    const where = status ? { status: status as never } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { user: { select: { name: true, email: true } }, orderItems: { include: { product: { select: { name: true, images: true } } } } },
        orderBy: { createdAt: "desc" },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.order.count({ where }),
    ]);
    return NextResponse.json({ success: true, data: orders, total, page, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
