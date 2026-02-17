import {
  type User,
  type InsertUser,
  type OtpCode,
  type Application,
  type InsertApplication,
  type Document,
  type InsertDocument,
  users,
  otpCodes,
  applications,
  documents,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserEmailVerified(id: string, verified: boolean): Promise<void>;

  createOtp(email: string, code: string, type: string, expiresAt: Date): Promise<OtpCode>;
  getValidOtp(email: string, code: string, type: string): Promise<OtpCode | undefined>;
  markOtpUsed(id: string): Promise<void>;

  createApplication(data: InsertApplication): Promise<Application>;
  getApplication(id: string): Promise<Application | undefined>;
  getApplicationsByUser(userId: string): Promise<Application[]>;
  getAllApplications(): Promise<(Application & { user?: User })[]>;
  updateApplication(id: string, data: Partial<Application>): Promise<Application | undefined>;

  deleteApplication(id: string): Promise<void>;

  createDocument(data: InsertDocument): Promise<Document>;
  getDocumentsByApplication(applicationId: string): Promise<Document[]>;
  deleteDocument(id: string): Promise<void>;

  getAllAdmins(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserEmailVerified(id: string, verified: boolean): Promise<void> {
    await db.update(users).set({ emailVerified: verified }).where(eq(users.id, id));
  }

  async createOtp(email: string, code: string, type: string, expiresAt: Date): Promise<OtpCode> {
    const [otp] = await db.insert(otpCodes).values({ email, code, type, expiresAt }).returning();
    return otp;
  }

  async getValidOtp(email: string, code: string, type: string): Promise<OtpCode | undefined> {
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.email, email),
          eq(otpCodes.code, code),
          eq(otpCodes.type, type),
          eq(otpCodes.used, false)
        )
      );
    if (otp && new Date(otp.expiresAt) > new Date()) {
      return otp;
    }
    return undefined;
  }

  async markOtpUsed(id: string): Promise<void> {
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, id));
  }

  private generateTRN(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let trn = "";
    for (let i = 0; i < 10; i++) {
      trn += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return trn;
  }

  async createApplication(data: InsertApplication): Promise<Application> {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const trn = this.generateTRN();
        const [app] = await db.insert(applications).values({ ...data, trn }).returning();
        return app;
      } catch (err: any) {
        if (err?.code === "23505" && attempt < 4) continue;
        throw err;
      }
    }
    throw new Error("Failed to generate unique TRN after multiple attempts");
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app;
  }

  async getApplicationsByUser(userId: string): Promise<Application[]> {
    return db.select().from(applications).where(eq(applications.userId, userId)).orderBy(desc(applications.createdAt));
  }

  async getAllApplications(): Promise<(Application & { user?: User })[]> {
    const results = await db
      .select()
      .from(applications)
      .leftJoin(users, eq(applications.userId, users.id))
      .orderBy(desc(applications.createdAt));

    return results.map((r) => ({
      ...r.applications,
      user: r.users || undefined,
    }));
  }

  async updateApplication(id: string, data: Partial<Application>): Promise<Application | undefined> {
    const [app] = await db
      .update(applications)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return app;
  }

  async deleteApplication(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.applicationId, id));
    await db.delete(applications).where(eq(applications.id, id));
  }

  async createDocument(data: InsertDocument): Promise<Document> {
    const [doc] = await db.insert(documents).values(data).returning();
    return doc;
  }

  async getDocumentsByApplication(applicationId: string): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.applicationId, applicationId));
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async getAllAdmins(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "admin"));
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }
}

export const storage = new DatabaseStorage();
