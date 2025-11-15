import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQRCodeSchema, insertQRCodeGroupSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/qrcodes", async (req, res) => {
    try {
      const userId = "demo_user";
      
      const validatedData = insertQRCodeSchema.parse(req.body);
      
      const qrCode = await storage.createQRCode({
        ...validatedData,
        userId,
      });
      res.json(qrCode);
    } catch (error) {
      console.error("Error creating QR code:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create QR code", message: error instanceof Error ? error.message : String(error) });
      }
    }
  });

  app.get("/api/qrcodes", async (req, res) => {
    try {
      const userId = "demo_user";
      const qrCodes = await storage.getQRCodesByUser(userId);
      res.json(qrCodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch QR codes" });
    }
  });

  app.get("/api/qrcodes/:id", async (req, res) => {
    try {
      const qrCode = await storage.getQRCode(req.params.id);
      if (!qrCode) {
        res.status(404).json({ error: "QR code not found" });
        return;
      }
      res.json(qrCode);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch QR code" });
    }
  });

  app.patch("/api/qrcodes/:id", async (req, res) => {
    try {
      const allowedUpdates = z.object({
        title: z.string().min(1).max(100).optional(),
        destinationUrl: z.string().url().optional(),
        foregroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        size: z.number().min(128).max(1024).optional(),
        isActive: z.boolean().optional(),
        groupId: z.string().nullable().optional(),
      });

      const validatedUpdates = allowedUpdates.parse(req.body);
      const qrCode = await storage.updateQRCode(req.params.id, validatedUpdates);
      
      if (!qrCode) {
        res.status(404).json({ error: "QR code not found" });
        return;
      }
      
      res.json(qrCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update QR code" });
      }
    }
  });

  app.delete("/api/qrcodes/:id", async (req, res) => {
    try {
      const success = await storage.deleteQRCode(req.params.id);
      
      if (!success) {
        res.status(404).json({ error: "QR code not found" });
        return;
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete QR code" });
    }
  });

  app.post("/api/groups", async (req, res) => {
    try {
      const userId = "demo_user";
      const validatedData = insertQRCodeGroupSchema.parse(req.body);
      
      const group = await storage.createGroup({
        ...validatedData,
        userId,
      });

      res.json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create group" });
      }
    }
  });

  app.get("/api/groups", async (req, res) => {
    try {
      const userId = "demo_user";
      const groups = await storage.getGroupsByUser(userId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/:id", async (req, res) => {
    try {
      const group = await storage.getGroup(req.params.id);
      if (!group) {
        res.status(404).json({ error: "Group not found" });
        return;
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch group" });
    }
  });

  app.patch("/api/groups/:id", async (req, res) => {
    try {
      const allowedUpdates = z.object({
        name: z.string().min(1).max(100).optional(),
        baseUrl: z.string().url().optional(),
        description: z.string().max(500).optional().nullable(),
      });

      const validatedUpdates = allowedUpdates.parse(req.body);
      const group = await storage.updateGroup(req.params.id, validatedUpdates);
      
      if (!group) {
        res.status(404).json({ error: "Group not found" });
        return;
      }
      
      res.json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update group" });
      }
    }
  });

  app.delete("/api/groups/:id", async (req, res) => {
    try {
      const success = await storage.deleteGroup(req.params.id);
      
      if (!success) {
        res.status(404).json({ error: "Group not found" });
        return;
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete group" });
    }
  });

  app.get("/api/groups/:id/qrcodes", async (req, res) => {
    try {
      const qrCodes = await storage.getQRCodesByGroup(req.params.id);
      res.json(qrCodes);
    } catch (error) {
      console.error("Error fetching QR codes for group:", error);
      res.status(500).json({ error: "Failed to fetch QR codes for group" });
    }
  });

  app.get("/api/qr/:shortCode", async (req, res) => {
    try {
      const qrCode = await storage.getQRCodeByShortCode(req.params.shortCode);
      
      if (!qrCode) {
        res.status(404).send("QR code not found");
        return;
      }

      if (!qrCode.isActive) {
        res.status(410).send("This QR code has been deactivated");
        return;
      }

      await storage.incrementScanCount(req.params.shortCode);

      res.redirect(qrCode.destinationUrl);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
