import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const actionSchema = z.object({
  action: z.enum(["dismiss", "resolve", "ban_profile", "delete_link"]),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const currentUserId = (session.user as any).id as string;

  switch (parsed.data.action) {
    case "dismiss":
      await prisma.report.update({ where: { id: report.id }, data: { status: "DISMISSED" } });
      break;
    case "resolve":
      await prisma.report.update({ where: { id: report.id }, data: { status: "RESOLVED" } });
      break;
    case "ban_profile":
      if (report.userId === currentUserId) {
        return NextResponse.json({ error: "You cannot suspend your own account" }, { status: 400 });
      }
      await prisma.user.update({ where: { id: report.userId }, data: { suspended: true } });
      await prisma.report.update({ where: { id: report.id }, data: { status: "RESOLVED" } });
      break;
    case "delete_link":
      if (report.linkId) {
        await prisma.link.deleteMany({ where: { id: report.linkId } });
      }
      await prisma.report.update({ where: { id: report.id }, data: { status: "RESOLVED" } });
      break;
  }

  return NextResponse.json({ ok: true });
}
