import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_-]+$/i, "Only letters, numbers, - and _ are allowed"),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { username, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const normalizedUsername = username.toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: normalizedEmail }, { username: normalizedUsername }] },
  });
  if (existing) {
    return NextResponse.json({ error: "Email or username already taken" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashed,
      theme: { create: {} },
    },
  });

  return NextResponse.json({ id: user.id, username: user.username });
}
