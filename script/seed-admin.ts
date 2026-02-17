import { db } from "../server/db";
import { users } from "../shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  const email = "shaan.codereve@gmail.com";
  const password = "admin";

  const existing = await db.select().from(users).where(eq(users.email, email));

  if (existing.length > 0) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.update(users).set({ 
      password: hashedPassword, 
      role: "admin", 
      emailVerified: true,
      firstName: "Shaan",
      lastName: "Admin",
    }).where(eq(users.email, email));
    console.log("Admin user updated.");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    email,
    firstName: "Shaan",
    lastName: "Admin",
    password: hashedPassword,
    role: "admin",
    emailVerified: true,
  });

  console.log("Admin user created:");
  console.log(`  Email: ${email}`);
  process.exit(0);
}

seedAdmin().catch(console.error);
