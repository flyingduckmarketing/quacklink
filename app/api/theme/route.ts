import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { limitsFor } from "@/lib/plans";

const themeSchema = z.object({
  backgroundColor: z.string().optional(),
  buttonColor: z.string().optional(),
  buttonTextColor: z.string().optional(),
  textColor: z.string().optional(),
  fontFamily: z.string().optional(),
  buttonStyle: z.enum(["rounded", "square", "pill"]).optional(),
  backgroundImage: z.string().url().nullable().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const theme = await prisma.theme.findUnique({ where: { userId: (session.user as any).id } });
  return NextResponse.json(theme);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = themeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const limits = limitsFor(user.plan);
  const data = { ...parsed.data };

  if (!limits.customThemeColors) {
    delete data.backgroundColor;
    delete data.buttonColor;
    delete data.buttonTextColor;
    delete data.textColor;
    delete data.fontFamily;
    delete data.buttonStyle;
  }
  if (!limits.backgroundImage) {
    delete data.backgroundImage;
  }

  const theme = await prisma.theme.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return NextResponse.json(theme);
}
