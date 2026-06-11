import { pgTable, serial, text, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  discount: numeric("discount", { precision: 5, scale: 2 }),
  imageUrl: text("image_url"),
  images: text("images").array(),
  categoryId: integer("category_id").notNull(),
  brand: text("brand"),
  stock: integer("stock").default(0).notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0").notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isDeal: boolean("is_deal").default(false).notNull(),
  isTrending: boolean("is_trending").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
