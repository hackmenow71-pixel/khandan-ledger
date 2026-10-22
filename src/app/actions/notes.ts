"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/auth";

export async function addNote(formData: FormData) {
  await checkAdmin();
  const text = formData.get("text") as string;
  const personId = formData.get("personId") as string | null;

  if (!text) return;

  await prisma.note.create({
    data: {
      text,
      personId: personId || null
    }
  });

  revalidatePath("/notes");
  if (personId) revalidatePath(`/persons/${personId}`);
}

export async function toggleNote(id: string, isCompleted: boolean) {
  await checkAdmin();
  const note = await prisma.note.update({
    where: { id },
    data: { isCompleted }
  });

  revalidatePath("/notes");
  if (note.personId) revalidatePath(`/persons/${note.personId}`);
}

export async function deleteNote(id: string) {
  await checkAdmin();
  const note = await prisma.note.delete({
    where: { id }
  });

  revalidatePath("/notes");
  if (note.personId) revalidatePath(`/persons/${note.personId}`);
}