import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { paypalFetch } from "@/lib/paypal";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const planId = process.env.PAYPAL_PREMIUM_PLAN_ID;
  if (!planId) {
    return NextResponse.json(
      { error: "PayPal is not configured yet. Set PAYPAL_PREMIUM_PLAN_ID in your environment." },
      { status: 501 }
    );
  }

  const userId = (session.user as any).id;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const res = await paypalFetch("/v1/billing/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      custom_id: userId,
      application_context: {
        brand_name: "QuackLink",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${appUrl}/dashboard/billing?paypal=success`,
        cancel_url: `${appUrl}/dashboard/billing?paypal=cancelled`,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json({ error: err.message ?? "Failed to start PayPal subscription" }, { status: 500 });
  }

  const data = await res.json();
  const approveLink = data.links?.find((l: any) => l.rel === "approve")?.href;

  return NextResponse.json({ subscriptionId: data.id, approveUrl: approveLink });
}
