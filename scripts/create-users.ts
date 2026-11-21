import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPass = process.env.ADMIN_PASSWORD ?? "admin12345";
  const editorPass = process.env.EDITOR_PASSWORD ?? "editor12345";

  if (adminPass.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }
  if (editorPass.length < 8) {
    throw new Error("EDITOR_PASSWORD must be at least 8 characters");
  }

  const adminHash = await bcrypt.hash(adminPass, 12);
  const editorHash = await bcrypt.hash(editorPass, 12);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: { password: adminHash },
    create: { username: "admin", password: adminHash, role: "admin" },
  });

  await prisma.user.upsert({
    where: { username: "editor" },
    update: { password: editorHash },
    create: { username: "editor", password: editorHash, role: "editor" },
  });

  console.log("Users created/updated successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());