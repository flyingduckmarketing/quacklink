import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  plan: z.enum(["FREE", "PREMIUM"]).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  suspended: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const currentUserId = (session.user as any).id;
  if (params.id === currentUserId && (parsed.data.role === "USER" || parsed.data.suspended === true)) {
    return NextResponse.json({ error: "You can't demote or suspend your own account" }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({
    id: user.id,
    username: user.username,
    email: user.email,
    plan: user.plan,
    role: user.role,
    suspended: user.suspended,
  });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const currentUserId = (session.user as any).id;
  if (params.id === currentUserId) {
    return NextResponse.json({ error: "You can't delete your own account" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
