import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  active: z.boolean().optional(),
});

async function assertBelongsToUser(linkId: string, userId: string) {
  const link = await prisma.link.findUnique({ where: { id: linkId } });
  if (!link || link.userId !== userId) return null;
  return link;
}

export async function PATCH(req: Request, { params }: { params: { id: string; linkId: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await assertBelongsToUser(params.linkId, params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const link = await prisma.link.update({ where: { id: params.linkId }, data: parsed.data });
  return NextResponse.json(link);
}

export async function DELETE(_req: Request, { params }: { params: { id: string; linkId: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await assertBelongsToUser(params.linkId, params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.link.delete({ where: { id: params.linkId } });
  return NextResponse.json({ ok: true });
}
