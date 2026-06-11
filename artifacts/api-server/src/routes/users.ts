import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getUserIdFromRequest } from "./auth";

const router = Router();

router.get("/users/profile", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

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

router.patch("/users/profile", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { name, phone, address, city, country } = req.body;
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (city !== undefined) updateData.city = city;
  if (country !== undefined) updateData.country = country;

  const [user] = await db.update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, userId))
    .returning();

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
