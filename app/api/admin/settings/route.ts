import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin";
import { getSettings, updateSettings } from "@/lib/settings";

const settingsSchema = z.object({
  freePlanLinkLimit: z.number().int().min(1).max(1000).optional(),
  premiumPriceINR: z.number().int().min(0).optional(),
  premiumPriceUSD: z.number().int().min(0).optional(),
  signupsEnabled: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
});

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const settings = await updateSettings(parsed.data);
  return NextResponse.json(settings);
}
