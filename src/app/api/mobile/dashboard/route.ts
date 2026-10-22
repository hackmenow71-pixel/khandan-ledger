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
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get the dashboard data
    const url = new URL(req.url);
    const dateFromStr = url.searchParams.get("dateFrom");
    const dateToStr = url.searchParams.get("dateTo");

    let dateFilter = {};
    if (dateFromStr || dateToStr) {
      dateFilter = {
        date: {
          ...(dateFromStr ? { gte: new Date(dateFromStr) } : {}),
          ...(dateToStr ? { lte: new Date(dateToStr) } : {})
        }
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: dateFilter,
      orderBy: { date: 'asc' },
    });

    let totalCredit = 0;
    let totalDebit = 0;
    let totalProfitPaid = 0;
    const categoryTotals: Record<string, number> = {};

    transactions.forEach(tr => {
      if (tr.type === "CREDIT") totalCredit += tr.amount;
      if (tr.type === "DEBIT") totalDebit += tr.amount;
      if (tr.type === "DEBIT_PROFIT") {
        totalDebit += tr.amount;
        totalProfitPaid += tr.amount;
      }
      
      if (tr.category) {
        if (!categoryTotals[tr.category]) categoryTotals[tr.category] = 0;
        categoryTotals[tr.category] += tr.amount;
      }
    });

    const netBalance = totalCredit - totalDebit;

    const personsCount = await prisma.person.count();

    const categoryArray = Object.keys(categoryTotals).map(key => ({
      name: key,
      amount: categoryTotals[key]
    })).sort((a, b) => b.amount - a.amount);

    return NextResponse.json({
      netBalance,
      totalCredit,
      totalDebit,
      totalProfitPaid,
      personsCount,
      categories: categoryArray,
    });
  } catch (error) {
    console.error("Mobile dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
