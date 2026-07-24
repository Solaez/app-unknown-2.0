import { pgTable, serial, text, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const romsTable = pgTable("roms", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  platformId: integer("platform_id").notNull(),
  platformName: text("platform_name").notNull(),
  genre: text("genre").notNull(),
  region: text("region").notNull().default("USA"),
  year: integer("year").notNull(),
  size: text("size").notNull(),
  coverUrl: text("cover_url"),
  rating: real("rating").notNull().default(0),
  downloadCount: integer("download_count").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  description: text("description"),
});

export const insertRomSchema = createInsertSchema(romsTable).omit({ id: true });
export type InsertRom = z.infer<typeof insertRomSchema>;
export type Rom = typeof romsTable.$inferSelect;
