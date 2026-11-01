import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    premiumUsers,
    suspendedUsers,
    newUsersLast7Days,
    totalLinks,
    clicksAgg,
    activeSubscriptions,
    openReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: "PREMIUM" } }),
    prisma.user.count({ where: { suspended: true } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.link.count(),
    prisma.link.aggregate({ _sum: { clicks: true } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
  ]);

  return NextResponse.json({
    totalUsers,
    premiumUsers,
    suspendedUsers,
    newUsersLast7Days,
    totalLinks,
    totalClicks: clicksAgg._sum.clicks ?? 0,
    activeSubscriptions,
    openReports,
  });
}
