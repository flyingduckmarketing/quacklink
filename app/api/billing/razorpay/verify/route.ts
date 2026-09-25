import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Called from the client right after Razorpay Checkout succeeds, so the UI
// can flip to Premium immediately. The webhook above remains the source of truth.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = await req.json();
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ error: "Razorpay not configured" }, { status: 501 });

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
  }

  const userId = (session.user as any).id;
  await prisma.user.update({ where: { id: userId }, data: { plan: "PREMIUM" } });
  await prisma.subscription.upsert({
    where: { providerSubId: razorpay_subscription_id },
    create: { userId, provider: "RAZORPAY", providerSubId: razorpay_subscription_id, status: "ACTIVE" },
    update: { status: "ACTIVE" },
  });

  return NextResponse.json({ ok: true });
}
