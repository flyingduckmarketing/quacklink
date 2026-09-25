"use client";

import { useState } from "react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { PRICING } from "@/lib/plans";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage() {
  const { data: session, update } = useSession();
  const plan = (session?.user as any)?.plan ?? "FREE";
  const [loading, setLoading] = useState<"razorpay" | "paypal" | "cancel" | null>(null);
  const [message, setMessage] = useState("");

  async function startRazorpay() {
    setLoading("razorpay");
    setMessage("");
    try {
      const res = await fetch("/api/billing/razorpay/create-subscription", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const rzp = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "QuackLink Premium",
        description: "Monthly subscription",
        theme: { color: "#4f46e5" },
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/billing/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            await update();
            setMessage("You're now on Premium! 🎉");
          }
        },
      });
      rzp.open();
    } catch (err: any) {
      setMessage(err.message ?? "Could not start Razorpay checkout");
    } finally {
      setLoading(null);
    }
  }

  async function startPayPal() {
    setLoading("paypal");
    setMessage("");
    try {
      const res = await fetch("/api/billing/paypal/create-subscription", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.approveUrl) window.location.href = data.approveUrl;
    } catch (err: any) {
      setMessage(err.message ?? "Could not start PayPal checkout");
      setLoading(null);
    }
  }

  async function cancelPlan() {
    setLoading("cancel");
    setMessage("");
    await fetch("/api/billing/cancel", { method: "POST" });
    await update();
    setMessage("Your plan has been downgraded to Free.");
    setLoading(null);
  }

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <h1 className="text-2xl font-bold">Billing</h1>
      <p className="mt-1 text-sm text-slate-500">
        You're currently on the <span className="font-semibold">{plan}</span> plan.
      </p>

      {message && <p className="mt-4 text-sm text-brand-600">{message}</p>}

      {plan === "PREMIUM" ? (
        <div className="mt-6 rounded-2xl border border-slate-200 p-6">
          <p className="font-medium">Premium is active. Thank you! 🦆</p>
          <button
            onClick={cancelPlan}
            disabled={loading === "cancel"}
            className="mt-4 rounded-full border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {loading === "cancel" ? "Cancelling..." : "Cancel subscription"}
          </button>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border-2 border-brand-600 p-6">
          <h2 className="text-lg font-semibold">Upgrade to Premium</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {PRICING.PREMIUM.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-brand-600">✓</span> {f}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={startRazorpay}
              disabled={loading !== null}
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading === "razorpay" ? "Starting..." : `Pay ₹${PRICING.PREMIUM.priceINR}/mo with Razorpay`}
            </button>
            <button
              onClick={startPayPal}
              disabled={loading !== null}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              {loading === "paypal" ? "Starting..." : `Pay $${PRICING.PREMIUM.priceUSD}/mo with PayPal`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
