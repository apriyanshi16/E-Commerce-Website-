import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";

const router = Router();

router.get("/categories", async (_req, res) => {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  res.json(categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    imageUrl: c.imageUrl,
    productCount: c.productCount,
  })));
});

export default router;
