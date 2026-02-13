import { db } from "../server/db";
import { users } from "../shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  const email = "admin@globalvisas.com";
  const existing = await db.select().from(users).where(eq(users.email, email));

  if (existing.length > 0) {
    console.log("Admin user already exists.");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  await db.insert(users).values({
    email,
    firstName: "Admin",
    lastName: "User",
    password: hashedPassword,
    role: "admin",
    emailVerified: true,
  });

  console.log("Admin user created:");
  console.log("  Email: admin@globalvisas.com");
  console.log("  Password: admin123");
  process.exit(0);
}

seedAdmin().catch(console.error);
