import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const status = new URL(req.url).searchParams.get("status") ?? "OPEN";

  const reports = await prisma.report.findMany({
    where: status === "ALL" ? {} : { status },
    include: {
      user: { select: { id: true, username: true, email: true, suspended: true } },
      link: { select: { id: true, title: true, url: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(reports);
}
