import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, desc, asc, sql } from "drizzle-orm";

const router = Router();

function formatProduct(p: any, categoryName: string) {
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
    categoryName,
    brand: p.brand,
    stock: p.stock,
    rating: parseFloat(p.rating),
    reviewCount: p.reviewCount,
    isFeatured: p.isFeatured,
    isDeal: p.isDeal,
    isTrending: p.isTrending,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  };
}

router.get("/products", async (req, res) => {
  const { q, categoryId, minPrice, maxPrice, sort, page = "1", limit = "24" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  if (q) conditions.push(ilike(productsTable.name, `%${q}%`));
  if (categoryId) conditions.push(eq(productsTable.categoryId, parseInt(categoryId)));
  if (minPrice) conditions.push(gte(productsTable.price, minPrice));
  if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));

  let orderBy;
  switch (sort) {
    case "price_asc": orderBy = asc(productsTable.price); break;
    case "price_desc": orderBy = desc(productsTable.price); break;
    case "rating": orderBy = desc(productsTable.rating); break;
    case "newest": orderBy = desc(productsTable.createdAt); break;
    case "popular": orderBy = desc(productsTable.reviewCount); break;
    default: orderBy = desc(productsTable.createdAt);
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [products, countResult, categories] = await Promise.all([
    db.select().from(productsTable).where(where).orderBy(orderBy).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
    db.select().from(categoriesTable),
  ]);

  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  const total = Number(countResult[0]?.count ?? 0);

  res.json({
    products: products.map(p => formatProduct(p, catMap[p.categoryId] ?? "")),
    total,
    page: pageNum,
    limit: limitNum,
  });
});

router.get("/products/featured", async (_req, res) => {
  const [products, categories] = await Promise.all([
    db.select().from(productsTable).where(eq(productsTable.isFeatured, true)).limit(12),
    db.select().from(categoriesTable),
  ]);
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  res.json(products.map(p => formatProduct(p, catMap[p.categoryId] ?? "")));
});

router.get("/products/deals", async (_req, res) => {
  const [products, categories] = await Promise.all([
    db.select().from(productsTable).where(eq(productsTable.isDeal, true)).limit(8),
    db.select().from(categoriesTable),
  ]);
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  res.json(products.map(p => formatProduct(p, catMap[p.categoryId] ?? "")));
});

router.get("/products/trending", async (_req, res) => {
  const [products, categories] = await Promise.all([
    db.select().from(productsTable).where(eq(productsTable.isTrending, true)).limit(10),
    db.select().from(categoriesTable),
  ]);
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  res.json(products.map(p => formatProduct(p, catMap[p.categoryId] ?? "")));
});

router.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
  if (!product) { res.status(404).json({ error: "Not found" }); return; }

  const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)).limit(1);
  res.json(formatProduct(product, category?.name ?? ""));
});

router.post("/products", async (req, res) => {
  const body = req.body;
  const [product] = await db.insert(productsTable).values({
    name: body.name,
    description: body.description,
    price: body.price.toString(),
    originalPrice: body.originalPrice?.toString(),
    imageUrl: body.imageUrl,
    categoryId: body.categoryId,
    brand: body.brand,
    stock: body.stock ?? 0,
    isFeatured: body.isFeatured ?? false,
    isDeal: body.isDeal ?? false,
    isTrending: body.isTrending ?? false,
  }).returning();
  const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)).limit(1);
  res.status(201).json(formatProduct(product, category?.name ?? ""));
});

export default router;
