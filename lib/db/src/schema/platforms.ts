import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const platformsTable = pgTable("platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  manufacturer: text("manufacturer").notNull(),
  romCount: integer("rom_count").notNull().default(0),
  iconUrl: text("icon_url"),
  color: text("color").notNull().default("#7c3aed"),
  year: integer("year").notNull(),
});

export const insertPlatformSchema = createInsertSchema(platformsTable).omit({ id: true });
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Platform = typeof platformsTable.$inferSelect;
