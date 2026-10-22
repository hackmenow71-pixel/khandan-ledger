import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role === 'VIEWER') {
    throw new Error("Unauthorized: Viewers cannot perform this action");
  }
}

export async function getUserRole(): Promise<string> {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role || "VIEWER";
}
