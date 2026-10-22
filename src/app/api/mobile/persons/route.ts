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

    const persons = await prisma.person.findMany({
      include: {
        transactions: true,
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formattedPersons = persons.map(person => {
      let balance = 0;
      let toBeGiven = 0;
      let toBeTaken = 0;

      person.transactions.forEach(tr => {
        if (tr.type === "CREDIT") balance += tr.amount;
        if (tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") balance -= tr.amount;
        if (tr.type === "TO_BE_GIVEN") toBeGiven += tr.amount;
        if (tr.type === "TO_BE_TAKEN") toBeTaken += tr.amount;
      });

      return {
        id: person.id,
        nameEnglish: person.nameEnglish,
        nameUrdu: person.nameUrdu,
        phone: person.phone,
        address: person.address,
        balance,
        toBeGiven,
        toBeTaken,
      };
    });

    return NextResponse.json(formattedPersons);
  } catch (error) {
    console.error("Mobile persons error:", error);
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
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { nameEnglish, nameUrdu, phone, address } = body;

    if (!nameEnglish) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newPerson = await prisma.person.create({
      data: {
        nameEnglish,
        nameUrdu: nameUrdu || "",
        phone: phone || "",
        address: address || "",
      }
    });

    return NextResponse.json({ success: true, person: newPerson });
  } catch (error) {
    console.error("Mobile add person error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
