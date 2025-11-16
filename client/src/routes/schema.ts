
export class User {
  id: string;
  name: string;
  email: string;

  constructor(id: string, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

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
  createdAt: string;

  constructor(objectToParse: any);
  constructor(objectToParse: any, userId: string);
  constructor(objectToParse: any, userId?: string) {
    if(userId) {
      // new instance from new QR Code
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
      this.createdAt = new Date().toISOString();
    } else {
      // new instance from existing QR Code
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

export class QRCodeGroupInstance {
  id: string;
  userId: string;
  name: string;
  baseUrl: string;
  description: string | null;
  createdAt: string;

  constructor(data: any)
  constructor(data: any, QRGroupId: string)
  constructor(data: any, QRGroupId?: string) {
    if(QRGroupId) {
      // new instance from existing group
      this.id = QRGroupId;
      this.userId = data.userId;
      this.name = data.name;
      this.baseUrl = data.baseUrl;
      this.description = data.description;
      this.createdAt = data.createdAt
    } else {
      // new instance from brand new group
      this.id = this.randomUUID(9);
      this.userId = data.userId;
      this.name = data.name;
      this.baseUrl = data.baseUrl;
      this.description = data.description ?? null;
      this.createdAt = new Date().toISOString();
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
}

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
  createdAt: string,
};