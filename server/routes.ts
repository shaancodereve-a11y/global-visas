import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { pool } from "./db";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { loginSchema, signupSchema, otpSchema, type User } from "@shared/schema";
import crypto from "crypto";
import { sendOtpEmail, sendStatusNotification, sendAdminNotification } from "./email";

const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://platform.seogent.io/webhook/immi-visa-application-submission";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

function normalizeValue(val: unknown): string | unknown {
  if (val === null || val === undefined) return "";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "string") {
    const lower = val.toLowerCase().trim();
    if (lower === "yes" || lower === "true") return "Yes";
    if (lower === "no" || lower === "false") return "No";
    return val;
  }
  return val;
}

function flattenWebhookPayload(applicationData: Record<string, unknown>, userData: Record<string, unknown>): Record<string, unknown> {
  const formData = (applicationData.formData || {}) as Record<string, unknown>;

  const flat: Record<string, unknown> = {
    event: "application_submitted",
    timestamp: new Date().toISOString(),

    application_id: applicationData.id,
    application_status: applicationData.status,
    application_current_step: applicationData.currentStep,
    application_admin_notes: applicationData.adminNotes || "",
    application_submitted_at: applicationData.submittedAt || "",
    application_created_at: applicationData.createdAt || "",

    applicant_id: userData.id,
    applicant_email: userData.email,
    applicant_username: userData.email || "",
    applicant_full_name: [userData.firstName, userData.lastName].filter(Boolean).join(" ") || "",
    applicant_role: userData.role || "applicant",
    applicant_verified: userData.emailVerified === true ? "Yes" : "No",
  };

  for (const [key, value] of Object.entries(formData)) {
    const normalized = normalizeValue(value);
    if (typeof normalized === "string") {
      flat[key] = normalized;
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        flat[key] = "";
      } else if (typeof value[0] === "object") {
        flat[key] = JSON.stringify(value);
        flat[`${key}_count`] = value.length;
      } else {
        flat[key] = value.map(v => normalizeValue(v)).join(", ");
      }
    } else if (typeof value === "object" && value !== null) {
      flat[key] = JSON.stringify(value);
    } else {
      flat[key] = String(value ?? "");
    }
  }

  return flat;
}

async function sendWebhook(applicationData: Record<string, unknown>, userData: Record<string, unknown>) {
  try {
    const payload = flattenWebhookPayload(applicationData, userData);
    const body = JSON.stringify(payload);
    console.log("Webhook payload:", JSON.stringify(payload, null, 2));

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (WEBHOOK_SECRET) {
      const signature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");
      headers["X-Webhook-Signature"] = signature;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    console.log(`Webhook sent: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.error("Webhook delivery failed:", error);
  }
}

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

  app.set("trust proxy", 1);

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

  app.get("/api-docs.html", (_req: Request, res: Response) => {
    const filePath = path.resolve(import.meta.dirname, "..", "client", "public", "api-docs.html");
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("API docs not found");
    }
  });

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
      const newUser = await storage.createUser({ email, firstName, lastName, password: hashedPassword });
      await storage.updateUserEmailVerified(newUser.id, true);

      req.session.userId = newUser.id;
      const { password: _, ...userData } = { ...newUser, emailVerified: true };
      res.status(201).json(userData);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.role === "admin") {
        return res.status(403).json({ error: "Please use the admin login page" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      const { password: _, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/admin-login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      let user = await storage.getUserByEmail(username);
      if (!user) {
        const allUsers = await storage.getAllUsers();
        user = allUsers.find((u) => u.email === username || u.firstName?.toLowerCase() === username.toLowerCase()) || undefined;
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admin accounts only." });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      const { password: _, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Admin login error:", error);
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
      if (formData !== undefined) {
        const sanitized = { ...formData, groupProcessing: "no" };
        delete sanitized.groupAlreadyCreated;
        delete sanitized.groupId;
        delete sanitized.groupName;
        delete sanitized.groupType;
        updateData.formData = sanitized;
      }
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
      if (app.status === "submitted") {
        return res.json(app);
      }

      const updated = await storage.updateApplication(req.params.id as string, {
        status: "submitted",
        submittedAt: new Date(),
      });

      const user = await storage.getUser(app.userId);
      if (user) {
        const { password: _pw, ...safeUser } = user;
        sendWebhook(updated as unknown as Record<string, unknown>, safeUser as unknown as Record<string, unknown>);
      }

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
      if (!status || !["draft", "submitted", "pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status." });
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

  app.get("/api/admin/admins", requireAdmin, async (_req: Request, res: Response) => {
    try {
      const admins = await storage.getAllAdmins();
      res.json(admins.map(({ password, ...a }) => a));
    } catch (error) {
      console.error("Get admins error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/admins", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { z } = await import("zod");
      const adminSchema = z.object({
        email: z.string().email("Please enter a valid email"),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      });
      const parsed = adminSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }
      const { email, firstName, lastName, password: rawPassword } = parsed.data;

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        if (existing.role === "admin") {
          return res.status(400).json({ error: "This user is already an admin" });
        }
        const updated = await storage.updateUserRole(existing.id, "admin");
        if (updated) {
          const { password, ...userData } = updated;
          return res.json(userData);
        }
      }

      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const newUser = await storage.createUser({ email, firstName, lastName, password: hashedPassword });
      await storage.updateUserRole(newUser.id, "admin");
      await storage.updateUserEmailVerified(newUser.id, true);
      const { password, ...userData } = { ...newUser, role: "admin", emailVerified: true };
      res.status(201).json(userData);
    } catch (error) {
      console.error("Create admin error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/admins/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      if (req.params.id === req.user!.id) {
        return res.status(400).json({ error: "You cannot remove your own admin access" });
      }
      const updated = await storage.updateUserRole(req.params.id as string, "applicant");
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ message: "Admin access removed" });
    } catch (error) {
      console.error("Remove admin error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/applications/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const app = await storage.getApplication(req.params.id as string);
      if (!app) {
        return res.status(404).json({ error: "Application not found" });
      }
      const applicant = await storage.getUser(app.userId);
      res.json({ ...app, user: applicant || undefined });
    } catch (error) {
      console.error("Admin get application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/applications/:id/submit", requireAdmin, async (req: Request, res: Response) => {
    try {
      const app = await storage.getApplication(req.params.id as string);
      if (!app) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (app.status === "submitted") {
        return res.json(app);
      }

      const updated = await storage.updateApplication(req.params.id as string, {
        status: "submitted",
        submittedAt: new Date(),
      });

      const user = await storage.getUser(app.userId);
      if (user) {
        const { password: _pw, ...safeUser } = user;
        sendWebhook(updated as unknown as Record<string, unknown>, safeUser as unknown as Record<string, unknown>);
      }

      res.json(updated);
    } catch (error) {
      console.error("Admin submit application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/applications/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const app = await storage.getApplication(req.params.id as string);
      if (!app) {
        return res.status(404).json({ error: "Application not found" });
      }
      await storage.deleteApplication(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Admin delete application error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/export", requireAdmin, async (_req: Request, res: Response) => {
    try {
      const apps = await storage.getAllApplications();

      const sanitizeCsvCell = (value: string): string => {
        let v = value;
        if (/^[=+\-@\t\r]/.test(v)) {
          v = "'" + v;
        }
        v = v.replace(/"/g, '""');
        return `"${v}"`;
      };

      const csvHeaders = [
        "Application ID",
        "Applicant Name",
        "Email",
        "Status",
        "Current Step",
        "Admin Notes",
        "Submitted At",
        "Created At",
        "Form Data",
      ];
      const csvRows = apps.map((app) => {
        const name = app.user ? `${app.user.firstName} ${app.user.lastName}` : "Unknown";
        const email = app.user?.email || "N/A";
        const formDataStr = JSON.stringify(app.formData || {});
        return [
          sanitizeCsvCell(app.id),
          sanitizeCsvCell(name),
          sanitizeCsvCell(email),
          sanitizeCsvCell(app.status),
          String(app.currentStep),
          sanitizeCsvCell(app.adminNotes || ""),
          app.submittedAt ? new Date(app.submittedAt).toISOString() : "",
          new Date(app.createdAt).toISOString(),
          sanitizeCsvCell(formDataStr),
        ].join(",");
      });

      const csv = [csvHeaders.join(","), ...csvRows].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=applications_${new Date().toISOString().split("T")[0]}.csv`);
      res.send(csv);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/documents", requireAuth, async (req: Request, res: Response) => {
    try {
      const { applicationId, name, objectPath, fileType, fileSize, category } = req.body;
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

      const isAdmin = req.user!.role === "admin";
      const doc = await storage.createDocument({
        applicationId,
        userId: isAdmin ? app.userId : req.user!.id,
        name,
        category: category || "other",
        objectPath,
        fileType: fileType || null,
        fileSize: fileSize || null,
        uploadedBy: isAdmin ? "admin" : "applicant",
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

  async function seedAdminAccount() {
    try {
      const hashedPassword = await bcrypt.hash("admin", 10);
      const adminUsername = "admin";
      const existing = await storage.getUserByEmail(adminUsername);
      if (!existing) {
        await storage.createUser({
          email: adminUsername,
          firstName: "Admin",
          lastName: "User",
          password: hashedPassword,
        });
        const admin = await storage.getUserByEmail(adminUsername);
        if (admin) {
          await pool.query('UPDATE users SET role = $1, email_verified = $2 WHERE id = $3', ['admin', true, admin.id]);
        }
        console.log("Admin account seeded successfully (admin/admin)");
      } else {
        await pool.query('UPDATE users SET password = $1, role = $2, email_verified = $3 WHERE email = $4', [hashedPassword, 'admin', true, adminUsername]);
      }
      await pool.query('UPDATE users SET password = $1 WHERE role = $2', [hashedPassword, 'admin']);
      console.log("All admin passwords reset to default (admin)");
    } catch (error) {
      console.error("Admin seeding error:", error);
    }
  }

  await seedAdminAccount();

  return httpServer;
}
