import { Router } from "express";
import { db } from "@workspace/db";
import { wishlistTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getUserIdFromRequest } from "./auth";

const router = Router();

router.get("/wishlist", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const wishlist = await db.select().from(wishlistTable).where(eq(wishlistTable.userId, userId));
  if (wishlist.length === 0) { res.json([]); return; }

  const products = await db.select().from(productsTable);
  const categories = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  const productMap = Object.fromEntries(products.map(p => [p.id, p]));
  const result = wishlist.map(w => {
    const p = productMap[w.productId];
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: parseFloat(p.price),
      originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
      discount: p.discount ? parseFloat(p.discount) : null,
      imageUrl: p.imageUrl,
      images: p.images || [],
      categoryId: p.categoryId,
      categoryName: catMap[p.categoryId] ?? "",
      brand: p.brand,
      stock: p.stock,
      rating: parseFloat(p.rating),
      reviewCount: p.reviewCount,
      isFeatured: p.isFeatured,
      isDeal: p.isDeal,
      isTrending: p.isTrending,
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    };
  }).filter(Boolean);

  res.json(result);
});

router.post("/wishlist/:productId", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const productId = parseInt(req.params.productId);
  const [existing] = await db.select().from(wishlistTable)
    .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)))
    .limit(1);

  if (!existing) {
    await db.insert(wishlistTable).values({ userId, productId });
  }

  res.json({ success: true });
});

router.delete("/wishlist/:productId", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const productId = parseInt(req.params.productId);
  await db.delete(wishlistTable)
    .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)));

  res.json({ success: true });
});

export default router;
