import nodemailer from "nodemailer";

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transport = getTransport();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "QuackLink <no-reply@quacklink.app>";

  if (!transport) {
    // No SMTP configured yet — log so the link is still reachable during setup/testing.
    console.warn(`[email] SMTP not configured. Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  await transport.sendMail({
    from,
    to,
    subject: "Reset your QuackLink password",
    text: `We got a request to reset your QuackLink password. This link expires in 30 minutes:\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #123524;">🦆 Reset your password</h2>
        <p>We got a request to reset your QuackLink password. This link expires in 30 minutes.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #123524; color: #fff; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 600;">
            Reset password
          </a>
        </p>
        <p style="color: #64748b; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
