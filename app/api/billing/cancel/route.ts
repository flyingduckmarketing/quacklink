import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient } from "@/lib/razorpay";
import { paypalFetch } from "@/lib/paypal";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (sub?.providerSubId) {
    try {
      if (sub.provider === "RAZORPAY") {
        await getRazorpayClient().subscriptions.cancel(sub.providerSubId);
      } else if (sub.provider === "PAYPAL") {
        await paypalFetch(`/v1/billing/subscriptions/${sub.providerSubId}/cancel`, {
          method: "POST",
          body: JSON.stringify({ reason: "User requested cancellation" }),
        });
      }
    } catch {
      // Provider cancellation may already be in that state; still downgrade locally.
    }
    await prisma.subscription.update({ where: { id: sub.id }, data: { status: "CANCELLED" } });
  }

  await prisma.user.update({ where: { id: userId }, data: { plan: "FREE" } });

  return NextResponse.json({ ok: true });
}
