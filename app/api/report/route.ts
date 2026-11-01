import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const reportSchema = z.object({
  username: z.string().min(1),
  linkId: z.string().optional(),
  reason: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { username, linkId, reason } = parsed.data;
  const user = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (linkId) {
    const link = await prisma.link.findUnique({ where: { id: linkId } });
    if (!link || link.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  await prisma.report.create({
    data: {
      type: linkId ? "LINK" : "PROFILE",
      userId: user.id,
      linkId: linkId ?? null,
      reason: reason ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
