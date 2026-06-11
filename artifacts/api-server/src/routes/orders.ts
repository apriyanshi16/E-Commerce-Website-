import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { getUserIdFromRequest } from "./auth";

const router = Router();

function formatOrder(order: any, items: any[]) {
  return {
    id: order.id,
    status: order.status,
    items: items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      price: parseFloat(i.price),
      quantity: i.quantity,
      imageUrl: i.imageUrl,
    })),
    subtotal: parseFloat(order.subtotal),
    shipping: parseFloat(order.shipping),
    total: parseFloat(order.total),
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    trackingNumber: order.trackingNumber,
    estimatedDelivery: order.estimatedDelivery,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
  };
}

router.get("/orders", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.userId, userId))
    .orderBy(sql`${ordersTable.createdAt} DESC`);

  const result = await Promise.all(orders.map(async order => {
    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
    return formatOrder(order, items);
  }));

  res.json(result);
});

router.get("/orders/summary", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId));
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);
  const pendingOrders = orders.filter(o => ["pending", "confirmed", "processing", "shipped"].includes(o.status)).length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;

  res.json({ totalOrders, totalSpent, pendingOrders, deliveredOrders });
});

router.post("/orders", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { shippingAddress, city, country, paymentMethod, cardLast4 } = req.body;
  if (!shippingAddress) { res.status(400).json({ error: "shippingAddress required" }); return; }

  const cartItems = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  if (cartItems.length === 0) { res.status(400).json({ error: "Cart is empty" }); return; }

  const productIds = cartItems.map(i => i.productId);
  const products = await db.select().from(productsTable);
  const prodMap = Object.fromEntries(products.map(p => [p.id, p]));

  const subtotal = cartItems.reduce((sum, item) => {
    const p = prodMap[item.productId];
    return sum + (p ? parseFloat(p.price) * item.quantity : 0);
  }, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  const fullAddress = city && country ? `${shippingAddress}, ${city}, ${country}` : shippingAddress;
  const estimatedDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const paymentDisplay = cardLast4 ? `Card ending in ${cardLast4}` : (paymentMethod || "Credit Card");

  const [order] = await db.insert(ordersTable).values({
    userId,
    status: "confirmed",
    subtotal: subtotal.toFixed(2),
    shipping: shipping.toFixed(2),
    total: total.toFixed(2),
    shippingAddress: fullAddress,
    paymentMethod: paymentDisplay,
    estimatedDelivery: estimatedDate,
  }).returning();

  const orderItemsData = cartItems.map(item => {
    const p = prodMap[item.productId];
    return {
      orderId: order.id,
      productId: item.productId,
      productName: p?.name ?? "Unknown",
      price: (p ? parseFloat(p.price) : 0).toFixed(2),
      quantity: item.quantity,
      imageUrl: p?.imageUrl ?? null,
    };
  });

  const insertedItems = await db.insert(orderItemsTable).values(orderItemsData).returning();

  // Clear cart after order placed
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

  res.status(201).json(formatOrder(order, insertedItems));
});

router.get("/orders/:id", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [order] = await db.select().from(ordersTable)
    .where(and(eq(ordersTable.id, id), eq(ordersTable.userId, userId)))
    .limit(1);

  if (!order) { res.status(404).json({ error: "Not found" }); return; }

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  res.json(formatOrder(order, items));
});

export default router;
