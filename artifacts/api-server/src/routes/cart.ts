import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { getUserIdFromRequest } from "./auth";

const router = Router();

async function getCartResponse(userId: number) {
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  if (items.length === 0) return { items: [], subtotal: 0, itemCount: 0 };

  const productIds = items.map(i => i.productId);
  const products = await db.select().from(productsTable).where(inArray(productsTable.id, productIds));
  const prodMap = Object.fromEntries(products.map(p => [p.id, p]));

  const cartItems = items.map(item => {
    const p = prodMap[item.productId];
    if (!p) return null;
    return {
      productId: item.productId,
      productName: p.name,
      price: parseFloat(p.price),
      originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
      quantity: item.quantity,
      imageUrl: p.imageUrl,
      stock: p.stock,
    };
  }).filter((i): i is NonNullable<typeof i> => i !== null);

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  return { items: cartItems, subtotal, itemCount };
}

router.get("/cart", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const cart = await getCartResponse(userId);
  res.json(cart);
});

router.post("/cart/items", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { productId, quantity = 1 } = req.body;
  if (!productId) { res.status(400).json({ error: "productId required" }); return; }

  const [existing] = await db.select().from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)))
    .limit(1);

  if (existing) {
    await db.update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({ userId, productId, quantity });
  }

  res.json(await getCartResponse(userId));
});

router.patch("/cart/items/:productId", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const productId = parseInt(req.params.productId);
  const { quantity } = req.body;

  if (quantity <= 0) {
    await db.delete(cartItemsTable)
      .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  } else {
    await db.update(cartItemsTable)
      .set({ quantity })
      .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  }

  res.json(await getCartResponse(userId));
});

router.delete("/cart/items/:productId", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const productId = parseInt(req.params.productId);
  await db.delete(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));

  res.json(await getCartResponse(userId));
});

router.delete("/cart/clear", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  res.json({ success: true });
});

export default router;
