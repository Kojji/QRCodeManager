import { type User, type InsertUser, type QRCode, type InsertQRCode } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createQRCode(qrCode: InsertQRCode & { userId: string }): Promise<QRCode>;
  getQRCode(id: string): Promise<QRCode | undefined>;
  getQRCodeByShortCode(shortCode: string): Promise<QRCode | undefined>;
  getQRCodesByUser(userId: string): Promise<QRCode[]>;
  updateQRCode(id: string, updates: Partial<QRCode>): Promise<QRCode | undefined>;
  deleteQRCode(id: string): Promise<boolean>;
  incrementScanCount(shortCode: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private qrCodes: Map<string, QRCode>;
  private shortCodeIndex: Map<string, string>;

  constructor() {
    this.users = new Map();
    this.qrCodes = new Map();
    this.shortCodeIndex = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createQRCode(data: InsertQRCode & { userId: string }): Promise<QRCode> {
    const id = randomUUID();
    const shortCode = this.generateShortCode();
    const qrCode: QRCode = {
      ...data,
      id,
      shortCode,
      isActive: true,
      scanCount: 0,
      lastScanned: null,
      createdAt: new Date().toISOString(),
    };
    this.qrCodes.set(id, qrCode);
    this.shortCodeIndex.set(shortCode, id);
    return qrCode;
  }

  async getQRCode(id: string): Promise<QRCode | undefined> {
    return this.qrCodes.get(id);
  }

  async getQRCodeByShortCode(shortCode: string): Promise<QRCode | undefined> {
    const id = this.shortCodeIndex.get(shortCode);
    if (!id) return undefined;
    return this.qrCodes.get(id);
  }

  async getQRCodesByUser(userId: string): Promise<QRCode[]> {
    return Array.from(this.qrCodes.values())
      .filter((qr) => qr.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateQRCode(id: string, updates: Partial<QRCode>): Promise<QRCode | undefined> {
    const qrCode = this.qrCodes.get(id);
    if (!qrCode) return undefined;
    
    const updated = { ...qrCode, ...updates };
    this.qrCodes.set(id, updated);
    return updated;
  }

  async deleteQRCode(id: string): Promise<boolean> {
    const qrCode = this.qrCodes.get(id);
    if (!qrCode) return false;
    
    this.shortCodeIndex.delete(qrCode.shortCode);
    this.qrCodes.delete(id);
    return true;
  }

  async incrementScanCount(shortCode: string): Promise<void> {
    const id = this.shortCodeIndex.get(shortCode);
    if (!id) return;
    
    const qrCode = this.qrCodes.get(id);
    if (!qrCode) return;
    
    qrCode.scanCount++;
    qrCode.lastScanned = new Date().toISOString();
    this.qrCodes.set(id, qrCode);
  }

  private generateShortCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    if (this.shortCodeIndex.has(code)) {
      return this.generateShortCode();
    }
    return code;
  }
}

export const storage = new MemStorage();
