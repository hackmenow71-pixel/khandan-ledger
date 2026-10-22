"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { checkAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export async function addPerson(formData: FormData) {
  await checkAdmin();
  const nameEnglish = formData.get("nameEnglish") as string;
  const nameUrdu = formData.get("nameUrdu") as string;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;

  if (!nameEnglish || !nameUrdu) return { error: "Both names are required" };

  const person = await prisma.person.create({
    data: { nameEnglish, nameUrdu, phone, address }
  });

  await logActivity("CREATE_PERSON", `Created account: ${nameEnglish}`);

  revalidatePath("/persons");
  return { success: true };
}

export async function updatePerson(formData: FormData) {
  await checkAdmin();
  const id = formData.get("id") as string;
  const nameEnglish = formData.get("nameEnglish") as string;
  const nameUrdu = formData.get("nameUrdu") as string;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;

  if (!id || !nameEnglish || !nameUrdu) return { error: "All fields are required" };

  await prisma.person.update({
    where: { id },
    data: { nameEnglish, nameUrdu, phone, address }
  });

  await logActivity("UPDATE_PERSON", `Updated account: ${nameEnglish}`);

  revalidatePath("/persons");
  revalidatePath(`/persons/${id}`);
  return { success: true };
}

export async function addTransaction(formData: FormData) {
  await checkAdmin();
  const personId = formData.get("personId") as string;
  const descriptionEnglish = formData.get("descriptionEnglish") as string;
  const descriptionUrdu = formData.get("descriptionUrdu") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const dateStr = formData.get("date") as string;

  const category = formData.get("category") as string || null;

  if (!personId || !descriptionEnglish || !descriptionUrdu || isNaN(amount) || !type) {
    return { error: "All fields are required" };
  }

  const transactionData: any = {
    personId,
    descriptionEnglish,
    descriptionUrdu,
    amount,
    type,
    category: category || null
  };

  if (dateStr) {
    transactionData.date = new Date(dateStr);
  } else {
    transactionData.date = null;
  }

  await prisma.transaction.create({
    data: transactionData
  });

  await logActivity("ADD_TRANSACTION", `Added ${type} of ${amount} for person ${personId}`);

  revalidatePath(`/persons/${personId}`);
  revalidatePath("/");
  return { success: true };
}

export async function updateTransaction(formData: FormData) {
  await checkAdmin();
  const id = formData.get("id") as string;
  const personId = formData.get("personId") as string;
  const descriptionEnglish = formData.get("descriptionEnglish") as string;
  const descriptionUrdu = formData.get("descriptionUrdu") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const dateStr = formData.get("date") as string;

  const category = formData.get("category") as string;

  if (!id || !descriptionEnglish || !descriptionUrdu || isNaN(amount) || !type) {
    return { error: "Required fields missing" };
  }

  const updateData: any = {
    descriptionEnglish,
    descriptionUrdu,
    amount,
    type,
    category: category || null,
    date: dateStr ? new Date(dateStr) : null
  };

  await prisma.transaction.update({
    where: { id },
    data: updateData
  });

  await logActivity("UPDATE_TRANSACTION", `Updated transaction ${id}`);

  revalidatePath(`/persons/${personId}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteTransaction(formData: FormData) {
  await checkAdmin();
  const id = formData.get("id") as string;
  const personId = formData.get("personId") as string;

  if (!id) return { error: "ID is required" };

  await prisma.transaction.delete({
    where: { id }
  });

  await logActivity("DELETE_TRANSACTION", `Deleted transaction ${id}`);

  revalidatePath(`/persons/${personId}`);
  revalidatePath("/");
  return { success: true };
}

export async function getAllPersonsForCopy() {
  await checkAdmin();
  return await prisma.person.findMany({
    select: { id: true, nameEnglish: true, nameUrdu: true },
    orderBy: { nameEnglish: 'asc' }
  });
}

export async function copyTransactionToAccounts(data: {
  sourcePersonId: string;
  targetPersonIds: string[];
  type: string;
  amount: number;
  dateStr?: string | null;
  descriptionEnglish: string;
  descriptionUrdu: string;
  category?: string | null;
}) {
  await checkAdmin();
  const { sourcePersonId, targetPersonIds, type, amount, dateStr, descriptionEnglish, descriptionUrdu, category } = data;

  if (!targetPersonIds || targetPersonIds.length === 0) {
    return { error: "Please select at least one account to copy to." };
  }
  if (!descriptionEnglish || !descriptionUrdu || isNaN(amount) || amount <= 0 || !type) {
    return { error: "Valid amount, type, and descriptions are required." };
  }

  let date: Date | null = null;
  if (dateStr && dateStr.trim() !== "") {
    date = new Date(dateStr);
  } else if (dateStr === null) {
    date = null;
  } else {
    date = new Date();
  }

  const records = targetPersonIds.map(personId => ({
    personId,
    descriptionEnglish,
    descriptionUrdu,
    amount,
    type,
    category: category || null,
    date
  }));

  await prisma.transaction.createMany({
    data: records
  });

  const targetPersons = await prisma.person.findMany({
    where: { id: { in: targetPersonIds } },
    select: { nameEnglish: true }
  });
  const targetNames = targetPersons.map(p => p.nameEnglish).join(", ");

  await logActivity(
    "COPY_TRANSACTION",
    `Copied ${type} of ${amount} to ${targetPersonIds.length} account(s): ${targetNames}`
  );

  for (const pid of targetPersonIds) {
    revalidatePath(`/persons/${pid}`);
  }
  if (sourcePersonId) {
    revalidatePath(`/persons/${sourcePersonId}`);
  }
  revalidatePath("/persons");
  revalidatePath("/");

  return { success: true, count: targetPersonIds.length, targetNames };
}

