import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  emoji: z.string().max(8).nullable().optional(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
});

async function assertOwnership(id: string, userId: string) {
  const link = await prisma.link.findUnique({ where: { id } });
  if (!link || link.userId !== userId) return null;
  return link;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const existing = await assertOwnership(params.id, userId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const link = await prisma.link.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(link);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const existing = await assertOwnership(params.id, userId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.link.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
