import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function sendDatabaseBackup() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn("Email credentials not configured for backup.");
    return false;
  }

  const dbPath = path.join(process.cwd(), 'dev.db');
  if (!fs.existsSync(dbPath)) {
    console.error("Database file not found at", dbPath);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const dateStr = new Date().toISOString().split('T')[0];
    
    await transporter.sendMail({
      from: `"Account Management App" <${emailUser}>`,
      to: emailUser,
      subject: `Weekly Database Backup - ${dateStr}`,
      text: "Attached is your automated weekly database backup (dev.db).\nKeep this safe!",
      attachments: [
        {
          filename: `dev_backup_${dateStr}.db`,
          path: dbPath
        }
      ]
    });
    
    return true;
  } catch (error) {
    console.error("Failed to send backup email:", error);
    return false;
  }
}
