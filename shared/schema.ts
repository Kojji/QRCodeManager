import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

export const qrCodes = pgTable("qr_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  destinationUrl: text("destination_url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  foregroundColor: text("foreground_color").notNull().default("#000000"),
  backgroundColor: text("background_color").notNull().default("#ffffff"),
  size: integer("size").notNull().default(256),
  isActive: boolean("is_active").notNull().default(true),
  scanCount: integer("scan_count").notNull().default(0),
  lastScanned: text("last_scanned"),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertQRCodeSchema = createInsertSchema(qrCodes).omit({
  id: true,
  userId: true,
  shortCode: true,
  scanCount: true,
  lastScanned: true,
  createdAt: true,
  isActive: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertQRCode = z.infer<typeof insertQRCodeSchema>;
export type QRCode = typeof qrCodes.$inferSelect;
