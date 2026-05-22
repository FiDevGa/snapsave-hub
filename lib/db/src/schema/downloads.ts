import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const downloadsTable = pgTable("downloads", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  type: text("type").notNull(), // 'mp4' | 'mp3'
  platform: text("platform").notNull().default("unknown"),
  title: text("title").notNull().default("Unknown"),
  thumbnail: text("thumbnail"),
  filesize: integer("filesize"),
  favorited: boolean("favorited").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDownloadSchema = createInsertSchema(downloadsTable).omit({ id: true, createdAt: true });
export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloadsTable.$inferSelect;
