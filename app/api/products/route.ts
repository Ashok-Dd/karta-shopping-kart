import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "createdAt";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: Record<string, unknown> = { isPublished: true };
    if (category) where.category = { equals: category, mode: "insensitive" };
    if (featured === "true") where.isFeatured = true;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, string> =
      sort === "price-asc" ? { price: "asc" }
      : sort === "price-desc" ? { price: "desc" }
      : sort === "popular" ? { reviewCount: "desc" }
      : { createdAt: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, take: pageSize, skip: (page - 1) * pageSize }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: products, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  images: z.array(z.string().url()).min(1),
  category: z.string().min(2),
  tags: z.array(z.string()).default([]),
  stock: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const slug = slugify(parsed.data.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const product = await prisma.product.create({
      data: { ...parsed.data, slug: finalSlug },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
