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

export const qrCodeGroups = pgTable("qr_code_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  baseUrl: text("base_url").notNull(),
  description: text("description"),
  createdAt: text("created_at").notNull(),
});

export const qrCodes = pgTable("qr_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  groupId: varchar("group_id"),
  title: text("title").notNull(),
  destinationUrl: text("destination_url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  foregroundColor: text("foreground_color").notNull().default("#000000"),
  backgroundColor: text("background_color").notNull().default("#ffffff"),
  size: integer("size").notNull().default(256),
  isActive: boolean("is_active").notNull().default(true),
  scanCount: integer("scan_count").notNull().default(0),
  lastScanned: text("last_scanned"),
  scanHistory: text("scan_history").notNull().default("[]"),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertQRCodeGroupSchema = createInsertSchema(qrCodeGroups).omit({
  id: true,
  userId: true,
  createdAt: true,
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
export type InsertQRCodeGroup = z.infer<typeof insertQRCodeGroupSchema>;
export type QRCodeGroup = typeof qrCodeGroups.$inferSelect;
export type InsertQRCode = z.infer<typeof insertQRCodeSchema>;
export type QRCode = typeof qrCodes.$inferSelect;

export class QRCodeInstance {
  id: string;
  userId: string;
  groupId: string | null;
  title: string;
  destinationUrl: string;
  shortCode: string;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  isActive: boolean;
  scanCount: number;
  lastScanned: string | null;
  scanHistory: string;
  createdAt: string;

  constructor(objectToParse: any);
  constructor(objectToParse: any, userId: string);
  constructor(objectToParse: any, userId?: string) {
    if(userId) {
      // new instance from new registry
      this.id = this.randomUUID(6);
      this.userId = userId;
      this.groupId = objectToParse.groupId ?? null;
      this.title = objectToParse.title;
      this.destinationUrl = objectToParse.destinationUrl;
      this.shortCode = this.randomUUID(9);
      this.foregroundColor = objectToParse.foregroundColor ?? "#000000";
      this.backgroundColor = objectToParse.backgroundColor ?? "#ffffff";
      this.size = objectToParse.size ?? 256;
      this.isActive = true;
      this.scanCount = 0;
      this.lastScanned = null;
      this.scanHistory = "[]";
      this.createdAt = new Date().toISOString();
    } else {
      // new instance from existing registry
      this.id = objectToParse.id;
      this.userId = objectToParse.userId;
      this.groupId = objectToParse.groupId;
      this.title = objectToParse.title;
      this.destinationUrl = objectToParse.destinationUrl;
      this.shortCode = objectToParse.shortCode;
      this.foregroundColor = objectToParse.foregroundColor;
      this.backgroundColor = objectToParse.backgroundColor;
      this.size = objectToParse.size;
      this.isActive = objectToParse.isActive;
      this.scanCount = objectToParse.scanCount;
      this.lastScanned = objectToParse.lastScanned;
      this.scanHistory = objectToParse.scanHistory;
      this.createdAt = objectToParse.createdAt;
    }
  }

  private randomUUID(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }
};

export interface SaveQRCodeInterface {
  id: string,
  userId: string,
  groupId: string,
  title: string,
  destinationUrl: string,
  shortCode: string,
  foregroundColor: string,
  backgroundColor: string,
  size: string,
  isActive: string,
  scanCount: string,
  lastScanned: string,
  scanHistory: string,
  createdAt: string,
};