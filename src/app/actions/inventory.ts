"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { checkAdmin } from "@/lib/auth";

const UPLOAD_DIR = "d:/account-management/uploads";

export async function uploadFile(formData: FormData) {
  await checkAdmin();
  const file = formData.get("file") as File;
  const personId = formData.get("personId") as string | null;
	  if (!file) return;
	  const bytes = await file.arrayBuffer();	  const buffer = Buffer.from(bytes);
	  const uniqueId = uuidv4();
  const extension = file.name.split(".").pop();
  const fileName = `${uniqueId}.${extension}`;
  const path = join(UPLOAD_DIR, fileName);
	await writeFile(path, buffer);

  await prisma.file.create({
    data: {
      name: file.name,
      path: fileName,
      mimeType: file.type,
      personId: personId || null
    }
  });

  revalidatePath("/inventory");
  if (personId) revalidatePath(`/persons/${personId}`);
}

export async function deleteFile(id: string) {
  await checkAdmin();
  const dbFile = await prisma.file.findUnique({ where: { id } });
  if (!dbFile) return;

  try {
    await unlink(join(UPLOAD_DIR, dbFile.path));
  } catch (error) {
    console.error("Error deleting physical file:", error);
  }

  await prisma.file.delete({ where: { id } });

  revalidatePath("/inventory");
  if (dbFile.personId) revalidatePath(`/persons/${dbFile.personId}`);
}