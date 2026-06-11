import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable, usersTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getUserIdFromRequest } from "./auth";

const router = Router();

router.get("/products/:id/reviews", async (req, res) => {
  const productId = parseInt(req.params.id);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const reviews = await db.select({
    id: reviewsTable.id,
    userId: reviewsTable.userId,
    rating: reviewsTable.rating,
    title: reviewsTable.title,
    body: reviewsTable.body,
    verified: reviewsTable.verified,
    createdAt: reviewsTable.createdAt,
    userName: usersTable.name,
    userAvatar: usersTable.avatar,
  }).from(reviewsTable)
    .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
    .where(eq(reviewsTable.productId, productId))
    .orderBy(sql`${reviewsTable.createdAt} DESC`);

  res.json(reviews.map(r => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName ?? "Anonymous",
    userAvatar: r.userAvatar,
    rating: r.rating,
    title: r.title,
    body: r.body,
    verified: r.verified,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  })));
});

router.post("/products/:id/reviews", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const productId = parseInt(req.params.id);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { rating, title, body } = req.body;
  if (!rating || rating < 1 || rating > 5) { res.status(400).json({ error: "Rating must be 1-5" }); return; }

  const [review] = await db.insert(reviewsTable).values({
    productId,
    userId,
    rating,
    title: title || null,
    body: body || null,
    verified: true,
  }).returning();

  // Update product rating
  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, productId));
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await db.update(productsTable)
    .set({ rating: avgRating.toFixed(2), reviewCount: reviews.length })
    .where(eq(productsTable.id, productId));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  res.status(201).json({
    id: review.id,
    userId: review.userId,
    userName: user?.name ?? "Anonymous",
    userAvatar: user?.avatar ?? null,
    rating: review.rating,
    title: review.title,
    body: review.body,
    verified: review.verified,
    createdAt: review.createdAt.toISOString(),
  });
});

export default router;
