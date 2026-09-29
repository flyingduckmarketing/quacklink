import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  backgroundColor: z.string().min(1).optional(),
  buttonColor: z.string().min(1).optional(),
  buttonTextColor: z.string().min(1).optional(),
  textColor: z.string().min(1).optional(),
  buttonStyle: z.enum(["rounded", "square", "pill"]).optional(),
  backgroundImage: z.string().url().nullable().optional(),
  premiumOnly: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const template = await prisma.template.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(template);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.template.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
