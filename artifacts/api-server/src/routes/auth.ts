import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "fashinhub_salt").digest("hex");
}

function makeToken(userId: number): string {
  return Buffer.from(`${userId}:${Date.now()}:fashinhub`).toString("base64");
}

function parseToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const parts = decoded.split(":");
    const id = parseInt(parts[0], 10);
    return isNaN(id) ? null : id;
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(req: any): number | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return parseToken(auth.slice(7));
}

router.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password || password.length < 6) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already in use" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash: hashPassword(password),
  }).returning();
  const token = makeToken(user.id);
  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      city: user.city,
      country: user.country,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const token = makeToken(user.id);
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      city: user.city,
      country: user.country,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

router.get("/auth/me", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    phone: user.phone,
    address: user.address,
    city: user.city,
    country: user.country,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
