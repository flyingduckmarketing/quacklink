import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export async function getSettings() {
  return prisma.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
}

export async function updateSettings(data: {
  freePlanLinkLimit?: number;
  premiumPriceINR?: number;
  premiumPriceUSD?: number;
  signupsEnabled?: boolean;
  maintenanceMode?: boolean;
}) {
  return prisma.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  });
}
