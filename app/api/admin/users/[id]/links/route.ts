import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const links = await prisma.link.findMany({
    where: { userId: params.id },
    orderBy: [{ kind: "asc" }, { order: "asc" }],
  });
  return NextResponse.json(links);
}
