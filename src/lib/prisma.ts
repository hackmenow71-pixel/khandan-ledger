import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

if (process.env.VERCEL) {
  try {
    const tmpDbPath = "/tmp/dev.db";
    const srcDbPath = path.join(process.cwd(), "prisma", "dev.db");
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(srcDbPath)) {
      fs.copyFileSync(srcDbPath, tmpDbPath);
    }
    process.env.DATABASE_URL = "file:/tmp/dev.db";
  } catch (e) {
    console.error("Failed to setup SQLite DB for Vercel /tmp:", e);
  }
}

const prismaClientSingleton = () => {
  return new PrismaClient()
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
