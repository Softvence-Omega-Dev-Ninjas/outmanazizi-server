/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("================== Seed Start ==================");

  // ----------------- Super Admin -----------------
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

  // ----------------- Categories & SubCategories -----------------
  const categoriesData = [
    {
      category: "CLEANING",
      subCategories: [
        "HOUSE_CLEANING",
        "DEEP_CLEANING",
        "END_OF_TENANCY_CLEANING",
        "OFFICE_CLEANING",
        "WINDOW_CLEANING",
        "CARPET_CLEANING",
        "AFTER_RENOVATION_CLEANING",
      ],
    },
    {
      category: "HANDYMAN_REPAIRS",
      subCategories: [
        "FURNITURE_ASSEMBLY",
        "MOUNT_TV_SHELVES",
        "SMALL_REPAIRS",
        "DRILLING_MOUNTING",
        "CURTAINS_BLINDS",
        "DOOR_LOCK_FIXING",
      ],
    },
    {
      category: "MOVING_TRANSPORT",
      subCategories: [
        "APARTMENT_MOVING",
        "FURNITURE_TRANSPORT",
        "HEAVY_LIFTING",
        "JUNK_REMOVAL",
        "VAN_WITH_HELPER",
      ],
    },
    {
      category: "ELECTRICAL_PLUMBING",
      subCategories: [
        "ELECTRICAL_INSTALLATION",
        "SOCKET_LIGHT_FIXING",
        "LIGHT_FIXING",
        "PLUMBING_REPAIRS",
        "TOILET_SINK_INSTALL",
        "LEAK_FIXING",
      ],
    },
    {
      category: "FURNITURE_CARPENTRY",
      subCategories: [
        "CUSTOM_FURNITURE",
        "WOODEN_REPAIR",
        "IKEA_ASSEMBLY",
        "SHELVING_INSTALLATION",
      ],
    },
    {
      category: "PAINTING_RENOVATION",
      subCategories: [
        "INDOOR_PAINTING",
        "OUTDOOR_PAINTING",
        "WALL_REPAIR",
        "SMALL_RENOVATION_JOBS",
      ],
    },
    {
      category: "GARDEN_OUTDOOR",
      subCategories: [
        "LAWN_MOWING",
        "HEDGE_TRIMMING",
        "GARDEN_CLEANUP",
        "OUTDOOR_MAINTENANCE",
      ],
    },
    {
      category: "IT_TECH",
      subCategories: [
        "COMPUTER_SETUP",
        "WIFI_ROUTER_HELP",
        "TV_SMART_HOME",
        "SOFTWARE_INSTALLATION",
        "PHONE_TABLET_HELP",
      ],
    },
    {
      category: "PERSONAL_HELP",
      subCategories: [
        "BABYSITTING",
        "ELDERLY_HELP",
        "PET_SITTING",
        "SHOPPING_ASSISTANCE",
        "PERSONAL_ASSISTANT",
      ],
    },
    {
      category: "EVENTS_TEMP_HELP",
      subCategories: [
        "EVENT_HELP",
        "MOVING_DAY_HELP",
        "CATERING_ASSISTANT",
        "DECORATION_SETUP",
      ],
    },
    {
      category: "DELIVERY_ERRANDS",
      subCategories: ["FOOD_DELIVERY", "DOCUMENT_DELIVERY", "SMALL_ERRANDS"],
    },
    {
      category: "AUTOMOTIVE_HELP",
      subCategories: ["CAR_WASH", "BATTERY_JUMP", "TIRE_CHANGE", "BASIC_CAR_HELP"],
    },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { category: cat.category as any },
      update: { subCategories: cat.subCategories as any },
      create: cat as any,
    });
  }

  console.log("✅ Categories & SubCategories seeded successfully");
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
