import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 20;
    const q = searchParams.get("q");

    const where = q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }] } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, take: pageSize, skip: (page - 1) * pageSize, orderBy: { createdAt: "desc" } }),
      prisma.product.count({ where }),
    ]);
    return NextResponse.json({ success: true, data: products, total, page, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  images: z.array(z.string()).min(1),
  category: z.string().min(2),
  tags: z.array(z.string()).default([]),
  stock: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const baseSlug = slugify(parsed.data.name);
    const existing = await prisma.product.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

    const product = await prisma.product.create({ data: { ...parsed.data, slug } });
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
