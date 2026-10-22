import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = "d:/account-management/uploads";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: fileId } = await params;
  const dbFile = await prisma.file.findUnique({ where: { id: fileId } });

  if (!dbFile) {
    return new NextResponse("File not found", { status: 404 });
  }

  try {
    const filePath = join(UPLOAD_DIR, dbFile.path);
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": dbFile.mimeType,
        "Content-Disposition": `inline; filename="${dbFile.name}"`,
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}