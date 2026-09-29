// Promotes an existing user to ADMIN by email. Run once to bootstrap your first admin:
//   DATABASE_URL="..." node scripts/make-admin.mjs you@example.com
import { PrismaClient } from "@prisma/client";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/make-admin.mjs <email>");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const user = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { role: "ADMIN" },
  });
  console.log(`@${user.username} (${user.email}) is now an ADMIN.`);
} catch (err) {
  console.error(`Could not promote ${email}:`, err.message ?? err);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
