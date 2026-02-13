import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { pool } from "./db";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { loginSchema, signupSchema, otpSchema, type User } from "@shared/schema";
import { sendOtpEmail, sendStatusNotification, sendAdminNotification } from "./email";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = user;
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  req.user = user;
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgStore = connectPgSimple(session);

  app.use(
    session({
      store: new PgStore({ pool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "global-visas-dev-secret-" + Date.now(),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  registerObjectStorageRoutes(app);

  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { email, firstName, lastName, password } = parsed.data;

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await storage.createUser({ email, firstName, lastName, password: hashedPassword });

      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await storage.createOtp(email, code, "verify", expiresAt);

      await sendOtpEmail(email, code, "verify");

      res.status(201).json({ message: "Account created. Please verify your email with the OTP sent.", email });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { email, password } = parsed.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await storage.createOtp(email, code, "login", expiresAt);

      await sendOtpEmail(email, code, "login");

      res.json({ requiresOtp: true, email });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/verify-otp", async (req: Request, res: Response) => {
    try {
      const parsed = otpSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { email, code } = parsed.data;

      let otp = await storage.getValidOtp(email, code, "verify");
      let otpType = "verify";
      if (!otp) {
        otp = await storage.getValidOtp(email, code, "login");
        otpType = "login";
      }

      if (!otp) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      await storage.markOtpUsed(otp.id);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      if (otpType === "verify") {
        await storage.updateUserEmailVerified(user.id, true);
      }

      req.session.userId = user.id;

      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/resend-otp", async (req: Request, res: Response) => {
    try {
      const { email, type } = req.body;
      if (!email || !type) {
        return res.status(400).json({ error: "Email and type are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await storage.createOtp(email, code, type, expiresAt);

      await sendOtpEmail(email, code, type);

      res.json({ message: "OTP resent successfully" });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { password, ...userData } = user;
    res.json(userData);
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/applications", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.user!.role === "admin") {
        const apps = await storage.getAllApplications();
        return res.json(apps);
      }
      const apps = await storage.getApplicationsByUser(req.user!.id);
      res.json(apps);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/applications", requireAuth, async (req: Request, res: Response) => {
    try {
      const app = await storage.createApplication({
        userId: req.user!.id,
        status: "draft",
        currentStep: 1,
        formData: {},
      });
      res.status(201).json(app);
    } catch (error) {
      console.error("Create application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/applications/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const app = await storage.getApplication(req.params.id as string);
      if (!app) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (app.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      res.json(app);
    } catch (error) {
      console.error("Get application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/applications/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const app = await storage.getApplication(req.params.id as string);
      if (!app) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (app.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { formData, currentStep, status } = req.body;
      const updateData: Record<string, unknown> = {};
      if (formData !== undefined) updateData.formData = formData;
      if (currentStep !== undefined) updateData.currentStep = currentStep;
      if (status !== undefined) updateData.status = status;

      const updated = await storage.updateApplication(req.params.id as string, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Update application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/applications/:id/submit", requireAuth, async (req: Request, res: Response) => {
    try {
      const app = await storage.getApplication(req.params.id as string);
      if (!app) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (app.userId !== req.user!.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const updated = await storage.updateApplication(req.params.id as string, {
        status: "submitted",
        submittedAt: new Date(),
      });
      res.json(updated);
    } catch (error) {
      console.error("Submit application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/applications", requireAdmin, async (_req: Request, res: Response) => {
    try {
      const apps = await storage.getAllApplications();
      res.json(apps);
    } catch (error) {
      console.error("Admin get applications error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/applications/:id/status", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { status, adminNotes } = req.body;
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be pending, approved, or rejected." });
      }

      const updateData: Record<string, unknown> = { status };
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

      const app = await storage.getApplication(req.params.id as string);
      if (!app) {
        return res.status(404).json({ error: "Application not found" });
      }

      const updated = await storage.updateApplication(req.params.id as string, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Application not found" });
      }

      const applicant = await storage.getUser(app.userId);
      if (applicant) {
        await sendStatusNotification(
          applicant.email,
          `${applicant.firstName} ${applicant.lastName}`,
          status,
          adminNotes
        );
      }

      res.json(updated);
    } catch (error) {
      console.error("Admin update status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (_req: Request, res: Response) => {
    try {
      const apps = await storage.getAllApplications();
      const stats = {
        total: apps.length,
        pending: apps.filter((a) => a.status === "pending" || a.status === "submitted").length,
        approved: apps.filter((a) => a.status === "approved").length,
        rejected: apps.filter((a) => a.status === "rejected").length,
        draft: apps.filter((a) => a.status === "draft").length,
      };
      res.json(stats);
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/documents", requireAuth, async (req: Request, res: Response) => {
    try {
      const { applicationId, name, objectPath, fileType, fileSize } = req.body;
      if (!applicationId || !name || !objectPath) {
        return res.status(400).json({ error: "applicationId, name, and objectPath are required" });
      }

      const app = await storage.getApplication(applicationId);
      if (!app) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (app.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const doc = await storage.createDocument({
        applicationId,
        userId: req.user!.id,
        name,
        objectPath,
        fileType: fileType || null,
        fileSize: fileSize || null,
      });
      res.status(201).json(doc);
    } catch (error) {
      console.error("Create document error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/documents/:applicationId", requireAuth, async (req: Request, res: Response) => {
    try {
      const app = await storage.getApplication(req.params.applicationId as string);
      if (!app) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (app.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const docs = await storage.getDocumentsByApplication(req.params.applicationId as string);
      res.json(docs);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/documents/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      await storage.deleteDocument(req.params.id as string);
      res.json({ message: "Document deleted" });
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
