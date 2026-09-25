import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Configure this URL in the Razorpay Dashboard -> Settings -> Webhooks,
// subscribed to subscription.activated / subscription.charged / subscription.cancelled / subscription.halted.
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 501 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const entity = event.payload?.subscription?.entity;
  const userId: string | undefined = entity?.notes?.userId;

  if (!userId) return NextResponse.json({ ok: true });

  switch (event.event) {
    case "subscription.activated":
    case "subscription.charged":
      await prisma.user.update({ where: { id: userId }, data: { plan: "PREMIUM" } });
      await prisma.subscription.upsert({
        where: { providerSubId: entity.id },
        create: {
          userId,
          provider: "RAZORPAY",
          providerSubId: entity.id,
          status: "ACTIVE",
          currentPeriodEnd: entity.current_end ? new Date(entity.current_end * 1000) : null,
        },
        update: {
          status: "ACTIVE",
          currentPeriodEnd: entity.current_end ? new Date(entity.current_end * 1000) : null,
        },
      });
      break;

    case "subscription.cancelled":
    case "subscription.halted":
    case "subscription.completed":
      await prisma.user.update({ where: { id: userId }, data: { plan: "FREE" } });
      await prisma.subscription
        .update({
          where: { providerSubId: entity.id },
          data: { status: "CANCELLED" },
        })
        .catch(() => {});
      break;
  }

  return NextResponse.json({ ok: true });
}
