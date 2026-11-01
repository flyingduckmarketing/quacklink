import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const themeSchema = z.object({
  backgroundColor: z.string().optional(),
  buttonColor: z.string().optional(),
  buttonTextColor: z.string().optional(),
  textColor: z.string().optional(),
  buttonStyle: z.enum(["rounded", "square", "pill"]).optional(),
  backgroundImage: z.string().url().nullable().optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const theme = await prisma.theme.findUnique({ where: { userId: params.id } });
  return NextResponse.json(theme);
}

// Admin edits bypass plan gating entirely — an admin fixing/moderating a
// user's page is trusted to set any value regardless of that user's plan.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = themeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const theme = await prisma.theme.upsert({
    where: { userId: params.id },
    create: { userId: params.id, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json(theme);
}
