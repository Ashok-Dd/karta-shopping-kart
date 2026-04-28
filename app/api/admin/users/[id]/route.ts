import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body   = await req.json();
  const parsed = z.object({ role: z.enum(["USER", "ADMIN"]) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  // Prevent self-demotion
  if (id === session.user.id && parsed.data.role !== "ADMIN") {
    return NextResponse.json({ error: "Cannot remove your own admin role" }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id }, data: { role: parsed.data.role } });
  return NextResponse.json({ success: true, data: user });
}