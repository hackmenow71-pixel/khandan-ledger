import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret_for_development";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET);

    const expenses = await prisma.recurringExpense.findMany({
      include: {
        payments: {
          orderBy: { datePaid: 'desc' }
        }
      }
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET);

    const body = await req.json();
    const { nameEnglish, expectedAmount, dueDay, category } = body;

    const expense = await prisma.recurringExpense.create({
      data: {
        nameEnglish,
        nameUrdu: "",
        expectedAmount: parseFloat(expectedAmount),
        dueDay: parseInt(dueDay),
        category: category || null,
      }
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
