import { type User, type InsertUser, type QRCode, type InsertQRCode, type QRCodeGroup, type InsertQRCodeGroup } from "@shared/schema";
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
  
  createGroup(group: InsertQRCodeGroup & { userId: string }): Promise<QRCodeGroup>;
  getGroup(id: string): Promise<QRCodeGroup | undefined>;
  getGroupsByUser(userId: string): Promise<QRCodeGroup[]>;
  updateGroup(id: string, updates: Partial<QRCodeGroup>): Promise<QRCodeGroup | undefined>;
  deleteGroup(id: string): Promise<boolean>;
  getQRCodesByGroup(groupId: string): Promise<QRCode[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private qrCodes: Map<string, QRCode>;
  private groups: Map<string, QRCodeGroup>;
  private shortCodeIndex: Map<string, string>;

  constructor() {
    this.users = new Map();
    this.qrCodes = new Map();
    this.groups = new Map();
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
      groupId: data.groupId ?? null,
      foregroundColor: data.foregroundColor ?? "#000000",
      backgroundColor: data.backgroundColor ?? "#ffffff",
      size: data.size ?? 256,
      isActive: true,
      scanCount: 0,
      lastScanned: null,
      scanHistory: "[]",
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
    
    const now = new Date().toISOString();
    const scanHistory = JSON.parse(qrCode.scanHistory || "[]") as string[];
    scanHistory.push(now);
    
    qrCode.scanCount++;
    qrCode.lastScanned = now;
    qrCode.scanHistory = JSON.stringify(scanHistory);
    this.qrCodes.set(id, qrCode);
  }

  async createGroup(data: InsertQRCodeGroup & { userId: string }): Promise<QRCodeGroup> {
    const id = randomUUID();
    const group: QRCodeGroup = {
      ...data,
      id,
      description: data.description ?? null,
      createdAt: new Date().toISOString(),
    };
    this.groups.set(id, group);
    return group;
  }

  async getGroup(id: string): Promise<QRCodeGroup | undefined> {
    return this.groups.get(id);
  }

  async getGroupsByUser(userId: string): Promise<QRCodeGroup[]> {
    return Array.from(this.groups.values())
      .filter((group) => group.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateGroup(id: string, updates: Partial<QRCodeGroup>): Promise<QRCodeGroup | undefined> {
    const group = this.groups.get(id);
    if (!group) return undefined;
    
    const updated = { ...group, ...updates };
    this.groups.set(id, updated);
    return updated;
  }

  async deleteGroup(id: string): Promise<boolean> {
    const group = this.groups.get(id);
    if (!group) return false;
    
    const groupQRCodes = await this.getQRCodesByGroup(id);
    for (const qr of groupQRCodes) {
      await this.updateQRCode(qr.id, { groupId: null });
    }
    
    this.groups.delete(id);
    return true;
  }

  async getQRCodesByGroup(groupId: string): Promise<QRCode[]> {
    return Array.from(this.qrCodes.values())
      .filter((qr) => qr.groupId === groupId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
