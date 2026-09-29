import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { limitsFor } from "@/lib/plans";

const schema = z.object({ templateId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const template = await prisma.template.findUnique({ where: { id: parsed.data.templateId } });
  if (!template || !template.active) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  if (template.premiumOnly && user.plan !== "PREMIUM") {
    return NextResponse.json({ error: "This template requires Premium." }, { status: 403 });
  }

  const limits = limitsFor(user.plan);
  const data = {
    backgroundColor: template.backgroundColor,
    buttonColor: template.buttonColor,
    buttonTextColor: template.buttonTextColor,
    textColor: template.textColor,
    buttonStyle: template.buttonStyle,
    backgroundImage: limits.backgroundImage ? template.backgroundImage : null,
  };

  const theme = await prisma.theme.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return NextResponse.json(theme);
}
