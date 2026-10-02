import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAddLink } from "@/lib/plans";

const PLATFORMS = [
  "instagram",
  "twitter",
  "youtube",
  "tiktok",
  "facebook",
  "linkedin",
  "github",
  "email",
  "website",
  "other",
] as const;

const linkSchema = z
  .object({
    title: z.string().min(1).max(100),
    url: z.string().url(),
    emoji: z.string().max(8).optional(),
    kind: z.enum(["LINK", "SOCIAL"]).default("LINK"),
    platform: z.enum(PLATFORMS).optional(),
  })
  .refine((data) => data.kind !== "SOCIAL" || !!data.platform, {
    message: "Platform is required for social icons",
    path: ["platform"],
  });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await prisma.link.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(links);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentCount = await prisma.link.count({ where: { userId, kind: "LINK" } });
  if (parsed.data.kind === "LINK" && !canAddLink(user.plan, currentCount)) {
    return NextResponse.json(
      { error: "Free plan is limited to 5 links. Upgrade to Premium for unlimited links." },
      { status: 403 }
    );
  }

  const siblingCount = await prisma.link.count({ where: { userId, kind: parsed.data.kind } });
  const link = await prisma.link.create({
    data: { ...parsed.data, userId, order: siblingCount },
  });

  return NextResponse.json(link, { status: 201 });
}
