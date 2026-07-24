import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const downloadsTable = pgTable("downloads", {
  id: serial("id").primaryKey(),
  romId: integer("rom_id").notNull(),
  romTitle: text("rom_title").notNull(),
  platformName: text("platform_name").notNull(),
  progress: real("progress").notNull().default(0),
  speed: text("speed").notNull().default("0 MB/s"),
  size: text("size").notNull(),
  status: text("status").notNull().default("downloading"), // downloading | paused | completed | cancelled
  startedAt: timestamp("started_at").notNull().defaultNow(),
  coverUrl: text("cover_url"),
});

export const insertDownloadSchema = createInsertSchema(downloadsTable).omit({ id: true });
export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloadsTable.$inferSelect;
