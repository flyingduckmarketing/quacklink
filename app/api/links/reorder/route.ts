import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const owned = await prisma.link.findMany({
    where: { id: { in: parsed.data.ids }, userId },
    select: { id: true },
  });
  if (owned.length !== parsed.data.ids.length) {
    return NextResponse.json({ error: "Invalid link list" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.ids.map((id, index) => prisma.link.update({ where: { id }, data: { order: index } }))
  );

  return NextResponse.json({ ok: true });
}
