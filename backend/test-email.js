// backend/test-email.js
require("dotenv").config();
const nodemailer = require("nodemailer");

async function testEmail() {
  console.log("📧 Testing email setup...");
  console.log("   EMAIL_USER:", process.env.EMAIL_USER || "❌ NOT SET");
  console.log("   EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ set" : "❌ NOT SET");
  console.log("   EMAIL_HOST:", process.env.EMAIL_HOST || "❌ NOT SET");
  console.log("   EMAIL_PORT:", process.env.EMAIL_PORT || "❌ NOT SET");

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("\n❌ EMAIL_USER or EMAIL_PASS missing in .env\n");
    return;
  }

  // ⭐ Using Brevo SMTP — NOT Gmail
  const transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,        // smtp-relay.brevo.com
    port:   parseInt(process.env.EMAIL_PORT), // 587
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: '"EventManager" <jainamshah898@gmail.com>',
      to: "jainamshah898@gmail.com",
      subject: "✅ EventManager — Email Test Working!",
      html: `
        <div style="background:#111128;padding:32px;border-radius:16px;font-family:Arial,sans-serif;color:#e2e2f0;max-width:500px;">
          <h2 style="color:#c4b5fd;margin:0 0 16px;">✅ Brevo SMTP is working!</h2>
          <p style="color:#9a9ab5;line-height:1.6;">Your EventManager email reminder system is configured correctly.</p>
          <p style="color:#9a9ab5;line-height:1.6;">Reminders will be sent every day at <strong style="color:#e879f9;">9:00 AM IST</strong> to users registered for events starting the next day.</p>
          <div style="margin-top:20px;padding:14px;background:rgba(124,58,237,0.15);border-radius:10px;">
            <p style="margin:0;color:#c4b5fd;font-size:13px;">Sent via Brevo SMTP from: ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      `,
    });
    console.log("\n✅ Test email sent successfully to", process.env.EMAIL_USER);
    console.log("   Check your inbox!\n");
  } catch (err) {
    console.error("\n❌ Email send failed:", err.message);
    console.log("\n💡 Check:");
    console.log("   1. EMAIL_PASS is the Brevo SMTP key (starts with xsmtpib-)");
    console.log("   2. EMAIL_HOST = smtp-relay.brevo.com");
    console.log("   3. EMAIL_PORT = 587");
    console.log("   4. In Brevo dashboard → SMTP & API → your email is verified\n");
  }
}

testEmail();