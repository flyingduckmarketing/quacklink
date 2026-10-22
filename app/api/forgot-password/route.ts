import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond the same way whether or not the account exists, so this
  // endpoint can't be used to enumerate registered emails. We also pad the
  // "no such user" path (below) to roughly match the real path's latency —
  // without it, the real path's SMTP round-trip would make its response
  // measurably slower, leaking account existence via timing even though the
  // response body is identical either way. (The send is awaited rather than
  // fire-and-forget because a serverless function can freeze immediately
  // after the response is sent, which would silently drop an unawaited send.)
  if (user && !user.suspended) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (err) {
      console.error("Failed to send password reset email:", err);
    }
  } else {
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  return NextResponse.json({
    message: "If an account exists for that email, we've sent a password reset link.",
  });
}
