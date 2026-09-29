import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const templateSchema = z.object({
  name: z.string().min(1).max(60),
  backgroundColor: z.string().min(1),
  buttonColor: z.string().min(1),
  buttonTextColor: z.string().min(1),
  textColor: z.string().min(1),
  buttonStyle: z.enum(["rounded", "square", "pill"]),
  backgroundImage: z.string().url().nullable().optional(),
  premiumOnly: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const templates = await prisma.template.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const count = await prisma.template.count();
  const template = await prisma.template.create({ data: { ...parsed.data, order: count } });
  return NextResponse.json(template, { status: 201 });
}
