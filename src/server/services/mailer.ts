import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export async function initTransporter() {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "zz13092002@gmail.com",
        pass: process.env.SMTP_PASS || "plkxcqaqdhfwqabd"
      },
      tls: { rejectUnauthorized: false }
    });
  } catch (e) {
    console.warn('⚠️ Could not configure SMTP, check .env variables.');
  }
}

export async function ensureTransporter() {
  if (!transporter) await initTransporter();
  return transporter;
}

export async function sendVerificationEmail(email: string, code: string) {
  try {
    const t = await ensureTransporter();
    if (!t) throw new Error("Transporter not initialized");
    await t.sendMail({
      from: process.env.SMTP_FROM || "no-reply@smartqueue.com",
      to: email,
      subject: "Your SmartQueueAnalyser verification code",
      html: `<div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;"><h2>Sign in to SmartQueueAnalyser</h2><p>Your verification code is:</p><div style="background: #f7f3f2; padding: 16px; border-radius: 8px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #ff682c; margin: 24px 0;">${code}</div><p style="font-size: 12px; color: #828282;">This code will expire in 10 minutes.</p></div>`
    });
  } catch (err) { 
    console.error('[Auth] email error:', err); 
  }
}