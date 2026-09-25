import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const planId = process.env.RAZORPAY_PREMIUM_PLAN_ID;
  if (!planId) {
    return NextResponse.json(
      { error: "Razorpay is not configured yet. Set RAZORPAY_PREMIUM_PLAN_ID in your environment." },
      { status: 501 }
    );
  }

  try {
    const razorpay = getRazorpayClient();
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120, // ~10 years of monthly billing; cancel anytime
      notes: { userId: (session.user as any).id },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to start Razorpay subscription" }, { status: 500 });
  }
}
