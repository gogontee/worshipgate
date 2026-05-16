// pages/api/send-reset-email.js
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fetch ALL users from Supabase Auth (handles pagination)
async function getAllUsers() {
  let allUsers = [];
  let page = 1;
  const perPage = 100;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    if (!data.users || data.users.length === 0) break;
    allUsers = [...allUsers, ...data.users];
    if (data.users.length < perPage) break;
    page++;
  }
  return allUsers;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let { email } = req.body;
    email = email?.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const allUsers = await getAllUsers();
    const user = allUsers.find(u => u.email?.trim().toLowerCase() === email);

    if (!user) {
      // Security: always return success even if user not found
      return res.status(200).json({ message: "If an account exists, a reset link will be sent" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    // Store token in password_resets table
    const { error: tokenError } = await supabase
      .from('password_resets')
      .insert({
        email: email,
        token: resetToken,
        expires_at: resetTokenExpiry.toISOString(),
        used: false
      });

    if (tokenError) {
      console.error("Token insertion error:", tokenError);
      return res.status(200).json({ message: "If an account exists, a reset link will be sent" });
    }

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/update-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Full HTML email (logo included)
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #fdf2f8;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f43f5e;
          }
          .logo-img {
            max-width: 100px;
            height: auto;
            display: inline-block;
          }
          .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #e11d48;
            margin-top: 10px;
          }
          .content {
            padding: 30px 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .button:hover {
            background: linear-gradient(135deg, #be123c 0%, #e11d48 100%);
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
          }
          .warning {
            background-color: #fef2f2;
            border-left: 4px solid #e11d48;
            padding: 12px;
            margin: 20px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body style="background-color: #fdf2f8; margin: 0; padding: 20px;">
        <div class="container">
          <div class="header">
            <div style="text-align: center;">
              <img 
                src="https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/logo/lovemateshow.png" 
                alt="Lovemate Show Logo" 
                class="logo-img" 
                width="100"
                height="auto"
                border="0"
              >
            </div>
            <div class="logo-text">Lovemate Show</div>
          </div>
          
          <div class="content">
            <h2 style="color: #333; margin-bottom: 16px;">Hello! 👋</h2>
            <p style="margin-bottom: 16px;">We received a request to reset your password for your Lovemate Show account (${email}).</p>
            <p style="margin-bottom: 24px;">Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password 🔐</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ This link will expire in 1 hour</strong><br>
              If you didn't request this, you can safely ignore this email.
            </div>
            
            <p style="margin-top: 24px; font-size: 14px; color: #6c757d;">
              Or copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #e11d48; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; 2024 Lovemate Show. All rights reserved.</p>
            <p>Making love connections around the world 💕</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "hello@lovemateshow.com",
      to: email,
      subject: "Reset Your Lovemate Show Password",
      html,
    });

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      return res.status(200).json({ message: "If an account exists, a reset link will be sent" });
    }

    return res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Unhandled error:", err);
    return res.status(200).json({ message: "If an account exists, a reset link will be sent" });
  }
}