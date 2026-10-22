import { NextRequest, NextResponse } from "next/server";
const { ZipArchive } = require("archiver");
import fs from "fs";
import path from "path";
import { PassThrough } from "stream";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  const uploadsPath = path.join(process.cwd(), "uploads");

  const passThrough = new PassThrough();

  const archive = new ZipArchive({
    zlib: { level: 9 },
  });

  archive.on("error", (err: any) => {
    console.error("Backup archive error:", err);
  });

  archive.pipe(passThrough);

  if (fs.existsSync(dbPath)) {
    archive.file(dbPath, { name: "database.db" });
  }

  if (fs.existsSync(uploadsPath)) {
    archive.directory(uploadsPath, "uploads");
  }

  // We don't await finalize here, we just call it and let it pipe.
  archive.finalize();

  // @ts-ignore
  const webStream = require('stream').Readable.toWeb(passThrough);

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.zip"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
