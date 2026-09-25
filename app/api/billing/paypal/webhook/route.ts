import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paypalFetch } from "@/lib/paypal";

// Configure this URL in the PayPal Developer Dashboard -> App -> Webhooks,
// subscribed to BILLING.SUBSCRIPTION.ACTIVATED / .CANCELLED / .SUSPENDED / .EXPIRED.
export async function POST(req: Request) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const rawBody = await req.text();
  const event = JSON.parse(rawBody);

  if (webhookId) {
    const verifyRes = await paypalFetch("/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: JSON.stringify({
        auth_algo: req.headers.get("paypal-auth-algo"),
        cert_url: req.headers.get("paypal-cert-url"),
        transmission_id: req.headers.get("paypal-transmission-id"),
        transmission_sig: req.headers.get("paypal-transmission-sig"),
        transmission_time: req.headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: event,
      }),
    });
    const verification = await verifyRes.json().catch(() => ({}));
    if (verification.verification_status !== "SUCCESS") {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }
  }

  const resource = event.resource;
  const userId: string | undefined = resource?.custom_id;
  if (!userId) return NextResponse.json({ ok: true });

  switch (event.event_type) {
    case "BILLING.SUBSCRIPTION.ACTIVATED":
      await prisma.user.update({ where: { id: userId }, data: { plan: "PREMIUM" } });
      await prisma.subscription.upsert({
        where: { providerSubId: resource.id },
        create: { userId, provider: "PAYPAL", providerSubId: resource.id, status: "ACTIVE" },
        update: { status: "ACTIVE" },
      });
      break;

    case "BILLING.SUBSCRIPTION.CANCELLED":
    case "BILLING.SUBSCRIPTION.SUSPENDED":
    case "BILLING.SUBSCRIPTION.EXPIRED":
      await prisma.user.update({ where: { id: userId }, data: { plan: "FREE" } });
      await prisma.subscription
        .update({ where: { providerSubId: resource.id }, data: { status: "CANCELLED" } })
        .catch(() => {});
      break;
  }

  return NextResponse.json({ ok: true });
}
