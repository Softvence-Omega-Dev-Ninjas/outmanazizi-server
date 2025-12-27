import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("================== Seed Start ==================");
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!superAdminEmail || !superAdminPassword) {
    throw new Error("❌ Super admin credentials are not set in environment variables (.env)");
  }

  const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

  const existingUser = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      password: hashedPassword,
      isEmailVerified: true,
    },
    create: {
      email: superAdminEmail,
      role: "ADMIN",
      name: "Super Admin",
      phone: "0000000000",
      picture: "",
      password: hashedPassword,
      isEmailVerified: true,
    },
  });

  if (existingUser) {
    console.log("✅ Super admin user created or already exists:", existingUser.email);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("🌱 Seeding completed successfully.");
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
