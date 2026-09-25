import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.link.update({
      where: { id: params.id },
      data: { clicks: { increment: 1 } },
    });
  } catch {
    // Link may not exist; ignore silently so the redirect UX is never blocked.
  }
  return NextResponse.json({ ok: true });
}
