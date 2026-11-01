import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Public, display-safe subset of platform settings — used by the landing
// page (pricing), the dashboard (free link limit), and register (signups
// enabled). No admin-only fields here.
export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({
    freePlanLinkLimit: settings.freePlanLinkLimit,
    premiumPriceINR: settings.premiumPriceINR,
    premiumPriceUSD: settings.premiumPriceUSD,
    signupsEnabled: settings.signupsEnabled,
    maintenanceMode: settings.maintenanceMode,
  });
}
