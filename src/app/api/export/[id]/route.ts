import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
const exceljs = require("exceljs");

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: personId } = await params;
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: { 
      transactions: { 
        orderBy: [
          { date: 'asc' },
          { type: 'asc' },
          { createdAt: 'asc' }
        ]
      } 
    }
  });

  if (!person) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet(person.nameEnglish.substring(0, 31));

  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Description (EN)', key: 'descEn', width: 30 },
    { header: 'Description (UR)', key: 'descUr', width: 30 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Balance', key: 'balance', width: 15 },
  ];

  let balance = 0;
  person.transactions.forEach(tr => {
    if (tr.type === "CREDIT") balance += tr.amount;
    if (tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") balance -= tr.amount;

    worksheet.addRow({
      date: tr.date ? new Date(tr.date).toLocaleDateString() : '',
      type: tr.type,
      descEn: tr.descriptionEnglish,
      descUr: tr.descriptionUrdu,
      amount: tr.amount,
      balance: balance
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${person.nameEnglish.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_ledger.xlsx"`,
    },
  });
}
