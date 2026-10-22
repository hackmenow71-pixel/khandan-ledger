import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret_for_development";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Only allow ADMIN to add transactions
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const { personId, amount, type, date, descriptionEnglish, descriptionUrdu, category, isCustomCategory } = body;

    if (!personId || !amount || !type || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        personId,
        amount: parseFloat(amount),
        type,
        date: new Date(date),
        descriptionEnglish: descriptionEnglish || "",
        descriptionUrdu: descriptionUrdu || "",
        category: category || null,
      }
    });

    return NextResponse.json({ success: true, transaction: newTransaction });

  } catch (error) {
    console.error("Mobile add transaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
