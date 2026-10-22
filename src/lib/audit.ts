import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function logActivity(action: string, details: string) {
  try {
    const session = await getServerSession(authOptions);
    const username = session?.user?.name || "System";
    
    await prisma.auditLog.create({
      data: {
        username,
        action,
        details
      }
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
