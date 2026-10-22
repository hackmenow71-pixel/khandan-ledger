"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/auth";

// ─── CATEGORIES ─────────────────────────────────────────────
export async function addCategory(formData: FormData) {
  await checkAdmin();
  const name = (formData.get("name") as string)?.trim();
  const emoji = (formData.get("emoji") as string)?.trim() || "📌";
  if (!name) return { error: "Name is required" };
  await prisma.category.upsert({
    where: { name },
    update: { emoji },
    create: { name, emoji }
  });
  revalidatePath("/settings");
}

export async function deleteCategory(formData: FormData) {
  await checkAdmin();
  const id = formData.get("id") as string;
  await prisma.category.delete({ where: { id } });
  revalidatePath("/settings");
}

// ─── TEMPLATES ──────────────────────────────────────────────
export async function saveTemplate(formData: FormData) {
  await checkAdmin();
  const label = (formData.get("label") as string)?.trim();
  const descriptionEnglish = formData.get("descriptionEnglish") as string;
  const descriptionUrdu = formData.get("descriptionUrdu") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const category = formData.get("category") as string || null;
  if (!label || !descriptionEnglish || !descriptionUrdu || isNaN(amount) || !type) {
    return { error: "All fields required" };
  }
  await prisma.transactionTemplate.create({
    data: { label, descriptionEnglish, descriptionUrdu, amount, type, category }
  });
  revalidatePath("/settings");
}

export async function deleteTemplate(formData: FormData) {
  await checkAdmin();
  const id = formData.get("id") as string;
  await prisma.transactionTemplate.delete({ where: { id } });
  revalidatePath("/settings");
}

// ─── CHEQUES ────────────────────────────────────────────────
export async function addCheque(formData: FormData) {
  await checkAdmin();
  const personId = formData.get("personId") as string;
  const chequeNumber = formData.get("chequeNumber") as string;
  const bankName = formData.get("bankName") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const dateStr = formData.get("date") as string;
  if (!personId || !chequeNumber || !bankName || isNaN(amount)) {
    return { error: "All fields required" };
  }
  await prisma.cheque.create({
    data: {
      personId,
      chequeNumber,
      bankName,
      amount,
      date: dateStr ? new Date(dateStr) : new Date()
    }
  });
  revalidatePath(`/persons/${personId}`);
}

export async function updateChequeStatus(formData: FormData) {
  await checkAdmin();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const personId = formData.get("personId") as string;
  await prisma.cheque.update({ where: { id }, data: { status } });
  revalidatePath(`/persons/${personId}`);
}

export async function deleteCheque(formData: FormData) {
  await checkAdmin();
  const id = formData.get("id") as string;
  const personId = formData.get("personId") as string;
  await prisma.cheque.delete({ where: { id } });
  revalidatePath(`/persons/${personId}`);
}

// ─── PERSON CONTACT INFO ────────────────────────────────────
export async function updatePersonContact(formData: FormData) {
  await checkAdmin();
  const id = formData.get("id") as string;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  await prisma.person.update({ where: { id }, data: { phone, address } });
  revalidatePath(`/persons/${id}`);
}
