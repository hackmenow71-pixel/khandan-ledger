"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/auth";

export async function addExpense(formData: FormData) {
  await checkAdmin();
  const nameEnglish = formData.get("nameEnglish") as string;
  const nameUrdu = formData.get("nameUrdu") as string;
  const expectedAmount = parseFloat(formData.get("expectedAmount") as string);
  const dueDateStr = formData.get("dueDate") as string;
  let dueDay = 1;
  if (dueDateStr) {
    const parts = dueDateStr.split("-");
    if (parts.length === 3) dueDay = parseInt(parts[2], 10);
  }

  if (!nameEnglish || !nameUrdu || isNaN(expectedAmount) || !dueDateStr) return;

  await prisma.recurringExpense.create({
    data: {
      nameEnglish,
      nameUrdu,
      expectedAmount,
      dueDay
    }
  });

  revalidatePath("/[locale]/expenses", "page");
}

export async function deleteExpense(id: string) {
  await checkAdmin();
  await prisma.recurringExpense.delete({ where: { id } });
  revalidatePath("/[locale]/expenses", "page");
}

export async function payExpense(formData: FormData) {
  await checkAdmin();
  const expenseId = formData.get("expenseId") as string;
  const month = formData.get("month") as string;
  const amountPaid = parseFloat(formData.get("amountPaid") as string);

  if (!expenseId || !month || isNaN(amountPaid)) return;

  await prisma.expensePayment.create({
    data: {
      expenseId,
      month,
      amountPaid
    }
  });

  revalidatePath("/[locale]/expenses", "page");
}

export async function undoPayment(id: string) {
  await checkAdmin();
  await prisma.expensePayment.delete({ where: { id } });
  revalidatePath("/[locale]/expenses", "page");
}

import { sendEmailAlert } from "@/lib/email";

export async function sendExpenseAlerts() {
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  const allExpenses = await prisma.recurringExpense.findMany({
    include: { payments: { where: { month: currentMonthStr } } }
  });
  
  const unpaidExpenses = allExpenses
    .filter(e => e.payments.length === 0)
    .filter(e => {
      const created = new Date(e.createdAt);
      const createdYear = created.getFullYear();
      const createdMonth = created.getMonth() + 1;
      return createdYear < today.getFullYear() || (createdYear === today.getFullYear() && createdMonth <= today.getMonth() + 1);
    });

  const overdue = unpaidExpenses.filter(e => Math.min(e.dueDay, daysInMonth) < today.getDate());
  const dueSoon = unpaidExpenses.filter(e => {
    const due = Math.min(e.dueDay, daysInMonth);
    return due >= today.getDate() && due <= today.getDate() + 3; // due in next 3 days
  });

  let text = "Account Management Alerts\n\n";

  if (overdue.length === 0 && dueSoon.length === 0) {
    text += "✅ All bills are paid up! You have no upcoming or overdue expenses right now.";
  } else {
    if (overdue.length > 0) {
      text += "🚨 OVERDUE EXPENSES:\n";
      overdue.forEach(e => {
        text += `• ${e.nameEnglish} - ${e.expectedAmount.toLocaleString()}\n`;
      });
      text += "\n";
    }

    if (dueSoon.length > 0) {
      text += "⚠️ DUE SOON:\n";
      dueSoon.forEach(e => {
        const days = Math.min(e.dueDay, daysInMonth) - today.getDate();
        const timeStr = days === 0 ? "Today" : `in ${days} days`;
        text += `• ${e.nameEnglish} - ${e.expectedAmount.toLocaleString()} (Due ${timeStr})\n`;
      });
    }
  }

  const success = await sendEmailAlert("Monthly Expenses Alert", text);
  if (success) {
    return { success: true, message: "Email sent successfully!" };
  } else {
    return { success: false, message: "Failed to send email. Check your EMAIL_USER and EMAIL_PASS in .env." };
  }
}
