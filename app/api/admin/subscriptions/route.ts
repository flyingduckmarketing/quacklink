import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const provider = searchParams.get("provider");

  const subscriptions = await prisma.subscription.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(provider ? { provider } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { username: true, email: true, plan: true } },
    },
  });

  return NextResponse.json(subscriptions);
}
