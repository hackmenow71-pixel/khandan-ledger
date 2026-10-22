import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret_for_development";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const resolvedParams = await params;
    const person = await prisma.person.findUnique({
      where: { id: resolvedParams.id },
      include: {
        transactions: {
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    let balance = 0;
    const transactionsWithRunningBalance = person.transactions.map(tr => {
      if (tr.type === "CREDIT") balance += tr.amount;
      if (tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") balance -= tr.amount;
      return {
        ...tr,
        runningBalance: balance
      };
    });

    return NextResponse.json({ 
      person: {
        id: person.id,
        nameEnglish: person.nameEnglish,
        nameUrdu: person.nameUrdu,
        phone: person.phone,
        address: person.address,
        balance
      },
      transactions: transactionsWithRunningBalance 
    });
  } catch (error) {
    console.error("Mobile person detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
