// Resets an existing user's password by email. Run:
//   DATABASE_URL="..." node scripts/reset-password.mjs you@example.com "NewPassword123!"
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [email, newPassword] = process.argv.slice(2);
if (!email || !newPassword) {
  console.error('Usage: node scripts/reset-password.mjs <email> "<newPassword>"');
  process.exit(1);
}
if (newPassword.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const hashed = await bcrypt.hash(newPassword, 10);
  const user = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { password: hashed },
  });
  console.log(`Password reset for @${user.username} (${user.email}).`);
} catch (err) {
  console.error(`Could not reset password for ${email}:`, err.message ?? err);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
