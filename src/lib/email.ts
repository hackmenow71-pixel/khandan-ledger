import nodemailer from 'nodemailer';

export async function sendEmailAlert(subject: string, text: string) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS; // App Password

  if (!emailUser || !emailPass) {
    console.warn("Email credentials not configured in .env");
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

    await transporter.sendMail({
      from: `"Account Management App" <${emailUser}>`,
      to: emailUser, // Send to yourself
      subject: subject,
      text: text,
      html: text.replace(/\n/g, '<br>')
    });
    
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
