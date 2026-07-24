import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const libraryTable = pgTable("library", {
  id: serial("id").primaryKey(),
  romId: integer("rom_id").notNull(),
  romTitle: text("rom_title").notNull(),
  platformName: text("platform_name").notNull(),
  platformSlug: text("platform_slug").notNull(),
  coverUrl: text("cover_url"),
  installedAt: timestamp("installed_at").notNull().defaultNow(),
  lastPlayedAt: timestamp("last_played_at"),
  fileSize: text("file_size").notNull(),
  timesPlayed: integer("times_played").notNull().default(0),
});

export const insertLibrarySchema = createInsertSchema(libraryTable).omit({ id: true });
export type InsertLibrary = z.infer<typeof insertLibrarySchema>;
export type Library = typeof libraryTable.$inferSelect;
